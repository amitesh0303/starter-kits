"""URL configuration for the API backend."""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI schema and documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # Health check
    path("", include("apps.core.urls")),
    # Auth endpoints
    path("api/auth/", include("apps.accounts.urls")),
    # API resources
    path("api/", include("apps.resources.urls")),
    # Billing and webhooks
    path("api/", include("apps.billing.urls")),
    # Allauth (for session-based flows)
    path("accounts/", include("allauth.urls")),
]
