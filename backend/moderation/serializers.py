from rest_framework import serializers

from submissions.policy import MAX_STORY_LENGTH

from .models import ModerationAction
from .policy import CONTENT_WARNINGS


class RedactionDraftInputSerializer(serializers.Serializer):
    redacted_text = serializers.CharField(max_length=MAX_STORY_LENGTH, trim_whitespace=False)
    content_warnings = serializers.ListField(
        child=serializers.ChoiceField(choices=sorted(CONTENT_WARNINGS)),
        required=False,
        default=list,
        max_length=5,
    )


class ModerationDecisionInputSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(
        choices=[
            ModerationAction.APPROVED,
            ModerationAction.REJECTED,
            ModerationAction.ESCALATED,
        ]
    )
    reason_code = serializers.CharField(required=False, allow_blank=True, max_length=48)
