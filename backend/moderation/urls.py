from django.urls import path

from .views import (
    ModerationCaseDetailView,
    ModerationClaimView,
    ModerationDecisionView,
    ModerationQueueView,
    RedactionDraftCreateView,
)

urlpatterns = [
    path("queue/", ModerationQueueView.as_view(), name="moderation-queue"),
    path("cases/<uuid:case_id>/", ModerationCaseDetailView.as_view(), name="moderation-case"),
    path("cases/<uuid:case_id>/claim/", ModerationClaimView.as_view(), name="moderation-claim"),
    path(
        "cases/<uuid:case_id>/drafts/",
        RedactionDraftCreateView.as_view(),
        name="moderation-draft-create",
    ),
    path(
        "cases/<uuid:case_id>/decision/",
        ModerationDecisionView.as_view(),
        name="moderation-decision",
    ),
]
