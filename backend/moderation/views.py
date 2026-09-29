from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from staff_accounts.permissions import (
    CanClaimModerationCase,
    CanDecideModerationCase,
    CanEditRedaction,
    CanViewRawSubmission,
)
from submissions.models import ConsentPurpose, ConsentRecord

from .exceptions import ModerationWorkflowError
from .models import ModerationCase, ModerationStatus
from .serializers import ModerationDecisionInputSerializer, RedactionDraftInputSerializer
from .services import claim_case, create_redaction_draft, decide_case


def _no_store(response: Response) -> Response:
    response["Cache-Control"] = "no-store"
    response["Pragma"] = "no-cache"
    response["X-Robots-Tag"] = "noindex, nofollow"
    return response


def _latest_screening(case: ModerationCase):
    return case.submission.privacy_screenings.order_by("-created_at").first()


def _queue_item(case: ModerationCase) -> dict:
    screening = _latest_screening(case)
    return {
        "id": str(case.id),
        "status": case.status,
        "assigned_to": case.assigned_to.username if case.assigned_to else None,
        "created_at": case.created_at,
        "privacy_screening_status": screening.status if screening else None,
        "privacy_finding_count": screening.finding_count if screening else None,
    }


def _case_detail(case: ModerationCase) -> dict:
    submission = case.submission
    screening = _latest_screening(case)
    latest_draft = case.drafts.order_by("-version").first()
    publication_consent = (
        ConsentRecord.objects.filter(
            submission=submission,
            purpose=ConsentPurpose.PUBLICATION,
        )
        .order_by("-recorded_at")
        .first()
    )

    screening_data = None
    if screening:
        screening_data = {
            "status": screening.status,
            "detector_version": screening.detector_version,
            "findings": [
                {
                    "category": finding.category,
                    "rule_id": finding.rule_id,
                    "start_offset": finding.start_offset,
                    "end_offset": finding.end_offset,
                }
                for finding in screening.findings.all()
            ],
        }

    draft_data = None
    if latest_draft:
        draft_data = {
            "version": latest_draft.version,
            "redacted_text": latest_draft.redacted_text,
            "content_warnings": latest_draft.content_warnings,
            "created_at": latest_draft.created_at,
        }

    return {
        "id": str(case.id),
        "status": case.status,
        "assigned_to": case.assigned_to.username if case.assigned_to else None,
        "submission": {
            "age_group": submission.age_group,
            "setting": submission.setting,
            "experience_types": submission.experience_types,
            "people_involved": submission.people_involved,
            "frequency": submission.frequency,
            "periods": submission.periods,
            "story_text": submission.story_text,
            "created_at": submission.created_at,
        },
        "publication_consent": {
            "granted": publication_consent.granted if publication_consent else False,
            "consent_text_version": (
                publication_consent.consent_text_version if publication_consent else None
            ),
        },
        "privacy_screening": screening_data,
        "latest_draft": draft_data,
        "events": [
            {
                "action": event.action,
                "actor": event.actor.username if event.actor else None,
                "from_status": event.from_status,
                "to_status": event.to_status,
                "reason_code": event.reason_code,
                "created_at": event.created_at,
            }
            for event in case.events.all()
        ],
    }


class ModerationQueueView(APIView):
    permission_classes = [CanViewRawSubmission]

    def get(self, request):
        cases = ModerationCase.objects.select_related("assigned_to", "submission").exclude(
            status__in=[ModerationStatus.APPROVED, ModerationStatus.REJECTED]
        )
        return _no_store(Response([_queue_item(case) for case in cases]))


class ModerationCaseDetailView(APIView):
    permission_classes = [CanViewRawSubmission]

    def get(self, request, case_id):
        case = get_object_or_404(
            ModerationCase.objects.select_related("submission", "assigned_to"),
            pk=case_id,
        )
        return _no_store(Response(_case_detail(case)))


class ModerationClaimView(APIView):
    permission_classes = [CanClaimModerationCase]
    parser_classes = [JSONParser]

    def post(self, request, case_id):
        get_object_or_404(ModerationCase, pk=case_id)
        try:
            case = claim_case(case_id, request.user)
        except ModerationWorkflowError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return _no_store(Response(_queue_item(case)))


class RedactionDraftCreateView(APIView):
    permission_classes = [CanEditRedaction]
    parser_classes = [JSONParser]

    def post(self, request, case_id):
        get_object_or_404(ModerationCase, pk=case_id)
        serializer = RedactionDraftInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            draft = create_redaction_draft(
                case_id,
                request.user,
                **serializer.validated_data,
            )
        except ModerationWorkflowError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return _no_store(
            Response(
                {
                    "version": draft.version,
                    "content_warnings": draft.content_warnings,
                    "created_at": draft.created_at,
                },
                status=201,
            )
        )


class ModerationDecisionView(APIView):
    permission_classes = [CanDecideModerationCase]
    parser_classes = [JSONParser]

    def post(self, request, case_id):
        get_object_or_404(ModerationCase, pk=case_id)
        serializer = ModerationDecisionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            case = decide_case(
                case_id,
                request.user,
                **serializer.validated_data,
            )
        except ModerationWorkflowError as exc:
            raise ValidationError({"detail": str(exc)}) from exc
        return _no_store(Response(_queue_item(case)))
