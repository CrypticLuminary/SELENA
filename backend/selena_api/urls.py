from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", include("core.urls")),
    path("api/staff/", include("staff_accounts.urls")),
    path("api/submissions/", include("submissions.urls")),
    path("api/moderation/", include("moderation.urls")),
    path("api/stories/", include("public_stories.public_urls")),
    path("api/publication/", include("public_stories.staff_urls")),
    path("api/patterns/", include("analytics.urls")),
]
