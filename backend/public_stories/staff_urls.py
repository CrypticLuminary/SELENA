from django.urls import path

from .views import PublishModerationCaseView

urlpatterns = [
    path(
        "cases/<uuid:case_id>/",
        PublishModerationCaseView.as_view(),
        name="publish-moderation-case",
    ),
]
