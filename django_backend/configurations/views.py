import logging
from django.db import transaction
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated

from configurations.models import AuthConfiguration
from configurations.serializers import ConfigurationSerializer
from authentication.models import AuthUser

logger = logging.getLogger(__name__)


def get_builder_session_id(request):
    """
    Extract builder_session_id from request body, query params, or HTTP header.
    """
    if isinstance(request.data, dict) and request.data.get("builder_session_id"):
        return str(request.data.get("builder_session_id")).strip()
    if request.query_params.get("builder_session_id"):
        return str(request.query_params.get("builder_session_id")).strip()
    if request.META.get("HTTP_X_BUILDER_SESSION_ID"):
        return str(request.META.get("HTTP_X_BUILDER_SESSION_ID")).strip()
    return None


def deep_merge_dicts(target, source):
    """
    Safely perform recursive deep merge of dictionary objects.
    Preserves all existing keys in target unless explicitly overridden by non-null values in source.
    """
    if not isinstance(target, dict):
        target = {}
    if not isinstance(source, dict):
        return target

    merged = dict(target)
    for key, val in source.items():
        if val is not None:
            if key in merged and isinstance(merged[key], dict) and isinstance(val, dict):
                merged[key] = deep_merge_dicts(merged[key], val)
            else:
                merged[key] = val
    return merged


def create_configuration_snapshot(config, user=None, change_source="manual_save"):
    """
    Create a versioned history snapshot in `auth_configuration_history`.
    """
    try:
        from configurations.models import AuthConfigurationHistory
        latest = AuthConfigurationHistory.objects.filter(configuration_id=config.id).order_by("-version_number").first()
        new_version = (latest.version_number + 1) if latest else 1

        AuthConfigurationHistory.objects.create(
            configuration=config,
            user=user if (user and user.is_authenticated) else (config.user if config.user_id else None),
            version_number=new_version,
            configuration_data=config.configuration_data or {},
            change_source=change_source
        )
    except Exception as ex:
        logger.warning(f"Failed to create history snapshot for config {config.id}: {ex}")


class OwnershipError(PermissionError):
    pass


def save_configuration(configuration_data, config_name=None, landing_url=None, redirect_url=None, builder_session_id=None, user=None, config_id=None, is_manual=False):
    """
    Authoritative helper function for upserting configurations with safe deep merge and strict ownership verification.
    """
    user_str = user.id if (user and user.is_authenticated) else f"Anonymous ({builder_session_id})"
    logger.info(f"[Configuration] Authenticated user: {user_str}")
    logger.info(f"[Configuration] Saving configuration")

    with transaction.atomic():
        existing = None

        if user and user.is_authenticated:
            # 1. If config_id passed, verify ownership
            if config_id:
                target = AuthConfiguration.objects.filter(id=config_id, is_active=True).first()
                if target:
                    if target.user_id and int(target.user_id) != int(user.id):
                        logger.warning(f"[Configuration] Ownership violation")
                        raise OwnershipError("Access denied. You do not own this configuration.")
                    existing = target

            # 2. If no config_id or target wasn't found, find active config owned by user
            if not existing:
                existing = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).first()

            # 3. If user has no active config, check for anonymous config to claim
            if not existing and builder_session_id:
                anon_config = AuthConfiguration.objects.filter(
                    builder_session_id=builder_session_id,
                    user_id__isnull=True,
                    is_active=True
                ).first()
                if anon_config:
                    existing = anon_config
                    existing.user_id = user.id
                    existing.builder_session_id = None

        else:
            # Anonymous session user
            if config_id:
                target = AuthConfiguration.objects.filter(id=config_id, is_active=True).first()
                if target:
                    if target.user_id is not None or (builder_session_id and target.builder_session_id != builder_session_id):
                        logger.warning(f"[Configuration] Ownership violation")
                        raise OwnershipError("Access denied. Session mismatch or owned configuration.")
                    existing = target

            if not existing and builder_session_id:
                existing = AuthConfiguration.objects.filter(
                    builder_session_id=builder_session_id,
                    user_id__isnull=True,
                    is_active=True
                ).first()

        if existing:
            if config_name:
                existing.configuration_name = config_name
            if landing_url is not None:
                existing.landing_url = landing_url
            if redirect_url is not None:
                existing.redirect_url = redirect_url
            if configuration_data is not None:
                existing.configuration_data = configuration_data
                if isinstance(configuration_data, dict):
                    red_url = configuration_data.get("redirect", {}).get("redirectUrl") or configuration_data.get("urls", {}).get("redirectUrl")
                    if red_url:
                        existing.redirect_url = red_url
            if user and user.is_authenticated:
                existing.user_id = user.id
                existing.builder_session_id = None

            existing.updated_at = timezone.now()
            existing.save()

            if is_manual:
                create_configuration_snapshot(existing, user=user, change_source="manual_save")

            logger.info(f"[Configuration] Active configuration: {existing.id}")
            logger.info(f"[Configuration] Save successful")
            return existing, False  # created=False
        else:
            new_config = AuthConfiguration.objects.create(
                user_id=user.id if (user and user.is_authenticated) else None,
                builder_session_id=builder_session_id if (not user or not user.is_authenticated) else None,
                configuration_name=config_name or "My Auth Page Experience",
                landing_url=landing_url,
                redirect_url=redirect_url,
                configuration_data=configuration_data or {},
                is_active=True
            )
            create_configuration_snapshot(new_config, user=user, change_source="initial_creation")
            logger.info(f"[Configuration] Active configuration: {new_config.id}")
            logger.info(f"[Configuration] Save successful")
            return new_config, True  # created=True


class ConfigurationListCreateView(APIView):
    """
    List user or anonymous session configurations, or save/upsert a configuration.
    GET /api/configurations
    POST /api/configurations
    """
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            session_id = get_builder_session_id(request)
            if request.user and request.user.is_authenticated:
                logger.info(f"[Configuration] Authenticated user: {request.user.id}")
                configs = AuthConfiguration.objects.filter(user_id=request.user.id, is_active=True).order_by("-updated_at")
                if configs.exists():
                    logger.info(f"[Configuration] Active configuration: {configs.first().id}")
            elif session_id:
                configs = AuthConfiguration.objects.filter(builder_session_id=session_id, is_active=True).order_by("-updated_at")
            else:
                return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

            serializer = ConfigurationSerializer(configs, many=True)
            return Response(
                {
                    "success": True,
                    "count": configs.count(),
                    "configurations": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"[ConfigurationListCreateView GET] Error fetching configurations: {str(e)}", exc_info=True)
            return Response({"success": False, "message": "Failed to fetch configurations."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            session_id = get_builder_session_id(request)
            config_id = request.data.get("id") or request.data.get("configuration_id") or request.data.get("config_id")

            serializer = ConfigurationSerializer(data=request.data)
            if not serializer.is_valid():
                errors = serializer.errors
                first_key = list(errors.keys())[0]
                err_msg = errors[first_key]
                err_str = err_msg[0] if isinstance(err_msg, list) else str(err_msg)
                return Response({"success": False, "message": err_str, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            val = serializer.validated_data
            user = request.user if (hasattr(request, "user") and request.user and request.user.is_authenticated) else None

            config, created = save_configuration(
                configuration_data=val.get("configuration_data"),
                config_name=val.get("configuration_name"),
                landing_url=val.get("landing_url"),
                redirect_url=val.get("redirect_url"),
                builder_session_id=val.get("builder_session_id") or session_id,
                user=user,
                config_id=config_id
            )

            return Response(
                {
                    "success": True,
                    "message": "Configuration saved successfully." if created else "Configuration updated successfully.",
                    "configuration": ConfigurationSerializer(config).data,
                },
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
            )
        except OwnershipError as oe:
            logger.warning("[Configuration] Ownership violation")
            return Response({"success": False, "message": str(oe)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"[Configuration] Save failed: {str(e)}", exc_info=True)
            return Response({"success": False, "message": "Failed to save configuration."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfigurationSaveView(APIView):
    """
    Dedicated endpoint for explicit configuration save/upsert.
    POST /api/configurations/save
    """
    permission_classes = [AllowAny]

    def post(self, request):
        return ConfigurationListCreateView().post(request)


class ConfigurationCurrentView(APIView):
    """
    Get or update the current active configuration for anonymous session or authenticated user.
    GET /api/configurations/current
    PUT /api/configurations/current
    """
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = get_builder_session_id(request)
        if request.user and request.user.is_authenticated:
            logger.info(f"[Configuration] Authenticated user: {request.user.id}")
            config = AuthConfiguration.objects.filter(user_id=request.user.id, is_active=True).order_by("-updated_at").first()
        elif session_id:
            config = AuthConfiguration.objects.filter(builder_session_id=session_id, is_active=True).order_by("-updated_at").first()
        else:
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not config:
            logger.warning("[Configuration] Configuration not found")
            return Response({"success": False, "message": "Configuration not found."}, status=status.HTTP_404_NOT_FOUND)

        logger.info(f"[Configuration] Active configuration: {config.id}")
        return Response({"success": True, "configuration": ConfigurationSerializer(config).data}, status=status.HTTP_200_OK)

    def put(self, request):
        session_id = get_builder_session_id(request)
        user = request.user if (hasattr(request, "user") and request.user and request.user.is_authenticated) else None
        data = request.data.get("configuration_data") or request.data

        try:
            config, created = save_configuration(
                configuration_data=data,
                config_name=request.data.get("configuration_name"),
                landing_url=request.data.get("landing_url"),
                redirect_url=request.data.get("redirect_url"),
                builder_session_id=session_id,
                user=user
            )
            return Response({"success": True, "configuration": ConfigurationSerializer(config).data}, status=status.HTTP_200_OK)
        except OwnershipError as oe:
            logger.warning("[Configuration] Ownership violation")
            return Response({"success": False, "message": str(oe)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            logger.error(f"[Configuration] Save failed: {str(e)}", exc_info=True)
            return Response({"success": False, "message": "Failed to save configuration."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfigurationCurrentView(APIView):
    """
    Get or update the current active configuration for anonymous session or authenticated user.
    GET /api/configurations/current
    PUT /api/configurations/current
    """
    permission_classes = [AllowAny]

    def get(self, request):
        session_id = get_builder_session_id(request)
        config = None
        if request.user and request.user.is_authenticated:
            config = AuthConfiguration.objects.filter(user_id=request.user.id, is_active=True).first()

        if not config and session_id:
            config = AuthConfiguration.objects.filter(builder_session_id=session_id, is_active=True).first()

        if not config:
            return Response({"success": False, "message": "No active configuration found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"success": True, "configuration": ConfigurationSerializer(config).data}, status=status.HTTP_200_OK)


class ConfigurationDetailView(APIView):
    """
    Retrieve, update or delete a specific configuration by ID.
    GET /api/configurations/<id>
    PUT /api/configurations/<id>
    DELETE /api/configurations/<id>
    """
    permission_classes = [AllowAny]

    def get_object(self, config_id, request):
        session_id = get_builder_session_id(request)
        try:
            config = AuthConfiguration.objects.get(id=config_id, is_active=True)
        except AuthConfiguration.DoesNotExist:
            logger.warning("[Configuration] Configuration not found")
            return None, Response({"success": False, "message": "Configuration not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user and request.user.is_authenticated:
            logger.info(f"[Configuration] Authenticated user: {request.user.id}")
            if config.user_id and int(config.user_id) != int(request.user.id):
                logger.warning("[Configuration] Ownership violation")
                return None, Response({"success": False, "message": "Access denied. You do not own this configuration."}, status=status.HTTP_403_FORBIDDEN)
            logger.info(f"[Configuration] Active configuration: {config.id}")
        elif session_id and config.builder_session_id and config.builder_session_id != session_id:
            logger.warning("[Configuration] Ownership violation")
            return None, Response({"success": False, "message": "Access denied. Session mismatch."}, status=status.HTTP_403_FORBIDDEN)

        return config, None

    def get(self, request, pk):
        config, error_response = self.get_object(pk, request)
        if error_response:
            return error_response

        serializer = ConfigurationSerializer(config)
        return Response({"success": True, "configuration": serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        config, error_response = self.get_object(pk, request)
        if error_response:
            return error_response

        serializer = ConfigurationSerializer(config, data=request.data, partial=True)
        if not serializer.is_valid():
            errors = serializer.errors
            first_key = list(errors.keys())[0]
            err_msg = errors[first_key]
            err_str = err_msg[0] if isinstance(err_msg, list) else str(err_msg)
            return Response({"success": False, "message": err_str, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        val = serializer.validated_data
        user = request.user if (hasattr(request, "user") and request.user and request.user.is_authenticated) else None

        updated_config, _ = save_configuration(
            configuration_data=val.get("configuration_data", config.configuration_data),
            config_name=val.get("configuration_name", config.configuration_name),
            landing_url=val.get("landing_url", config.landing_url),
            redirect_url=val.get("redirect_url", config.redirect_url),
            builder_session_id=val.get("builder_session_id") or config.builder_session_id,
            user=user,
            config_id=config.id
        )

        return Response(
            {
                "success": True,
                "message": "Configuration updated successfully.",
                "configuration": ConfigurationSerializer(updated_config).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        config, error_response = self.get_object(pk, request)
        if error_response:
            return error_response

        with transaction.atomic():
            config.is_active = False
            config.save(update_fields=["is_active"])

        return Response({"success": True, "message": "Configuration deleted successfully."}, status=status.HTTP_200_OK)


class FileUploadView(APIView):
    """
    Upload custom background or logo image to Django Media storage.
    POST /api/configurations/upload, /api/upload
    """
    permission_classes = [AllowAny]

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".bmp", ".avif"}

    def post(self, request):
        uploaded_file = request.FILES.get("file") or request.FILES.get("image")
        if not uploaded_file:
            return Response({"success": False, "message": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        import os
        from django.conf import settings
        from django.core.files.storage import FileSystemStorage

        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return Response(
                {
                    "success": False,
                    "message": "Only image files (.jpg, .png, .webp, .svg, .gif, etc.) are allowed for upload."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        uploads_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)

        fs = FileSystemStorage(location=uploads_dir, base_url=settings.MEDIA_URL + "uploads/")
        saved_name = fs.save(uploaded_file.name, uploaded_file)
        file_url = fs.url(saved_name)

        return Response(
            {
                "success": True,
                "message": "File uploaded successfully.",
                "url": file_url,
                "filename": saved_name,
            },
            status=status.HTTP_201_CREATED
        )


class ConfigurationHistoryListView(APIView):
    """
    Get version history snapshots for a configuration.
    GET /api/configurations/<id>/history
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from configurations.models import AuthConfigurationHistory
        snapshots = AuthConfigurationHistory.objects.filter(configuration_id=pk).order_by("-version_number")[:20]
        data = [
            {
                "id": s.id,
                "version_number": s.version_number,
                "change_source": s.change_source,
                "created_at": s.created_at,
                "user_id": s.user_id,
            }
            for s in snapshots
        ]
        return Response({"success": True, "count": len(data), "history": data}, status=status.HTTP_200_OK)


class ConfigurationHistoryRestoreView(APIView):
    """
    Restore a configuration snapshot by version ID.
    POST /api/configurations/<id>/history/<version_id>/restore
    """
    permission_classes = [AllowAny]

    def post(self, request, pk, version_id):
        from configurations.models import AuthConfiguration, AuthConfigurationHistory
        try:
            config = AuthConfiguration.objects.get(id=pk, is_active=True)
            snapshot = AuthConfigurationHistory.objects.get(id=version_id, configuration_id=pk)
            with transaction.atomic():
                config.configuration_data = snapshot.configuration_data
                config.updated_at = timezone.now()
                config.save()
            return Response(
                {
                    "success": True,
                    "message": f"Restored version #{snapshot.version_number} successfully.",
                    "configuration": ConfigurationSerializer(config).data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"success": False, "message": f"Failed to restore version: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
