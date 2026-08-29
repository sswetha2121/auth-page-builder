from django.urls import path
from configurations.views import (
    ConfigurationListCreateView,
    ConfigurationSaveView,
    ConfigurationCurrentView,
    ConfigurationDetailView,
    FileUploadView,
    ConfigurationHistoryListView,
    ConfigurationHistoryRestoreView,
)

urlpatterns = [
    path("", ConfigurationListCreateView.as_view(), name="configuration-list-create"),
    path("save", ConfigurationSaveView.as_view(), name="configuration-save"),
    path("save/", ConfigurationSaveView.as_view(), name="configuration-save-slash"),
    path("current", ConfigurationCurrentView.as_view(), name="configuration-current"),
    path("current/", ConfigurationCurrentView.as_view(), name="configuration-current-slash"),
    path("upload", FileUploadView.as_view(), name="configuration-upload"),
    path("upload/", FileUploadView.as_view(), name="configuration-upload-slash"),
    path("<int:pk>", ConfigurationDetailView.as_view(), name="configuration-detail"),
    path("<int:pk>/", ConfigurationDetailView.as_view(), name="configuration-detail-slash"),
    path("<int:pk>/history", ConfigurationHistoryListView.as_view(), name="configuration-history-list"),
    path("<int:pk>/history/", ConfigurationHistoryListView.as_view(), name="configuration-history-list-slash"),
    path("<int:pk>/history/<int:version_id>/restore", ConfigurationHistoryRestoreView.as_view(), name="configuration-history-restore"),
    path("<int:pk>/history/<int:version_id>/restore/", ConfigurationHistoryRestoreView.as_view(), name="configuration-history-restore-slash"),
]
