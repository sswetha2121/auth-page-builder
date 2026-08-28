from django.urls import path
from configurations.views import (
    ConfigurationListCreateView,
    ConfigurationDetailView,
)

urlpatterns = [
    path("", ConfigurationListCreateView.as_view(), name="configuration-list-create"),
    path("<int:pk>", ConfigurationDetailView.as_view(), name="configuration-detail"),
    path("<int:pk>/", ConfigurationDetailView.as_view(), name="configuration-detail-slash"),
]
