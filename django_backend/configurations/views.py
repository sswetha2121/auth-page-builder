from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from configurations.models import AuthConfiguration
from configurations.serializers import ConfigurationSerializer


class ConfigurationListCreateView(APIView):
    """
    List all user configurations or create a new one.
    GET /api/configurations
    POST /api/configurations
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        configs = AuthConfiguration.objects.filter(user_id=user.id, is_active=True).order_by("-updated_at")
        serializer = ConfigurationSerializer(configs, many=True)
        return Response(
            {
                "success": True,
                "count": configs.count(),
                "configurations": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        user = request.user
        serializer = ConfigurationSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            first_key = list(errors.keys())[0]
            err_msg = errors[first_key]
            err_str = err_msg[0] if isinstance(err_msg, list) else str(err_msg)
            return Response({"success": False, "message": err_str, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        config = serializer.save(user=user, is_active=True)
        return Response(
            {
                "success": True,
                "message": "Configuration saved successfully.",
                "configuration": ConfigurationSerializer(config).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ConfigurationDetailView(APIView):
    """
    Retrieve, update or delete a specific configuration.
    GET /api/configurations/<id>
    PUT /api/configurations/<id>
    DELETE /api/configurations/<id>
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, config_id, user):
        try:
            config = AuthConfiguration.objects.get(id=config_id, is_active=True)
        except AuthConfiguration.DoesNotExist:
            return None, Response({"success": False, "message": "Configuration not found."}, status=status.HTTP_404_NOT_FOUND)

        if int(config.user_id) != int(user.id):
            return None, Response({"success": False, "message": "Access denied. You do not own this configuration."}, status=status.HTTP_403_FORBIDDEN)

        return config, None

    def get(self, request, pk):
        config, error_response = self.get_object(pk, request.user)
        if error_response:
            return error_response

        serializer = ConfigurationSerializer(config)
        return Response({"success": True, "configuration": serializer.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        config, error_response = self.get_object(pk, request.user)
        if error_response:
            return error_response

        serializer = ConfigurationSerializer(config, data=request.data, partial=True)
        if not serializer.is_valid():
            errors = serializer.errors
            first_key = list(errors.keys())[0]
            err_msg = errors[first_key]
            err_str = err_msg[0] if isinstance(err_msg, list) else str(err_msg)
            return Response({"success": False, "message": err_str, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_config = serializer.save()
        return Response(
            {
                "success": True,
                "message": "Configuration updated successfully.",
                "configuration": ConfigurationSerializer(updated_config).data,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        config, error_response = self.get_object(pk, request.user)
        if error_response:
            return error_response

        config.delete()
        return Response(
            {
                "success": True,
                "message": "Configuration deleted successfully.",
            },
            status=status.HTTP_200_OK,
        )
