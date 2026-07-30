"""Resources URL configuration."""

from rest_framework.routers import DefaultRouter

from apps.resources.views import APIResourceViewSet

router = DefaultRouter()
router.register(r"resources", APIResourceViewSet, basename="apiresource")

urlpatterns = router.urls
