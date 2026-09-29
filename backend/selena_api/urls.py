from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", include("core.urls")),
    path("api/staff/", include("staff_accounts.urls")),
]
