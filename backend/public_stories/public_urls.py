from django.urls import path

from .views import (
    PublicStoryDetailView,
    PublicStoryListView,
    StoryReportCreateView,
)

urlpatterns = [
    path("", PublicStoryListView.as_view(), name="public-story-list"),
    path("<uuid:story_id>/", PublicStoryDetailView.as_view(), name="public-story-detail"),
    path(
        "<uuid:story_id>/reports/",
        StoryReportCreateView.as_view(),
        name="public-story-report",
    ),
]
