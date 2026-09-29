from __future__ import annotations

from rest_framework import serializers

from .models import PublicationChoice
from .policy import (
    MAX_EXPERIENCE_TYPES,
    MAX_PEOPLE_INVOLVED,
    MAX_PERIODS,
    MAX_STORY_LENGTH,
)
from .taxonomy import (
    AGE_GROUPS,
    DETAILS_BY_RELATIONSHIP,
    EXPERIENCE_TYPES,
    FREQUENCIES,
    INVOLVEMENT,
    PERIOD_AGE_BANDS,
    PERSON_AGE_BANDS,
    PERSON_RELATIONSHIP_CATEGORIES,
    PERSON_RELATIONSHIP_DETAILS,
    SETTINGS,
)


class StrictSerializer(serializers.Serializer):
    """Reject unknown keys instead of silently discarding them."""

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Expected an object.")

        unknown = set(data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError(
                {"non_field_errors": ["Unknown fields are not accepted."]}
            )
        return super().to_internal_value(data)


class PersonInvolvedSerializer(StrictSerializer):
    relationship_category = serializers.CharField(allow_blank=True, max_length=32)
    relationship_detail = serializers.CharField(allow_blank=True, max_length=32)
    involvement = serializers.CharField(allow_blank=True, max_length=24)
    age_band = serializers.CharField(allow_blank=True, max_length=24)

    def validate_relationship_category(self, value):
        if value not in PERSON_RELATIONSHIP_CATEGORIES | {""}:
            raise serializers.ValidationError("Invalid relationship category.")
        return value

    def validate_relationship_detail(self, value):
        if value not in PERSON_RELATIONSHIP_DETAILS:
            raise serializers.ValidationError("Invalid relationship detail.")
        return value

    def validate_involvement(self, value):
        if value not in INVOLVEMENT:
            raise serializers.ValidationError("Invalid involvement value.")
        return value

    def validate_age_band(self, value):
        if value not in PERSON_AGE_BANDS:
            raise serializers.ValidationError("Invalid age band.")
        return value

    def validate(self, attrs):
        category = attrs["relationship_category"]
        detail = attrs["relationship_detail"]
        allowed_details = DETAILS_BY_RELATIONSHIP.get(category)

        if allowed_details is None and detail:
            raise serializers.ValidationError(
                {"relationship_detail": "This relationship category has no detail option."}
            )
        if allowed_details is not None and detail and detail not in allowed_details:
            raise serializers.ValidationError(
                {"relationship_detail": "Detail does not match the relationship category."}
            )
        return attrs


class PeriodSerializer(StrictSerializer):
    start_age_band = serializers.CharField(allow_blank=True, max_length=24)
    end_age_band = serializers.CharField(allow_blank=True, max_length=24)

    def validate_start_age_band(self, value):
        if value not in PERIOD_AGE_BANDS:
            raise serializers.ValidationError("Invalid age band.")
        return value

    def validate_end_age_band(self, value):
        if value not in PERIOD_AGE_BANDS:
            raise serializers.ValidationError("Invalid age band.")
        return value


class AnonymousSubmissionSerializer(StrictSerializer):
    age_group = serializers.CharField(max_length=24)
    setting = serializers.CharField(max_length=32)
    experience_types = serializers.ListField(
        child=serializers.CharField(max_length=32),
        min_length=1,
        max_length=MAX_EXPERIENCE_TYPES,
    )
    people_involved = PersonInvolvedSerializer(
        many=True,
        required=False,
        default=list,
        max_length=MAX_PEOPLE_INVOLVED,
    )
    frequency = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        max_length=32,
    )
    periods = PeriodSerializer(
        many=True,
        required=False,
        default=list,
        max_length=MAX_PERIODS,
    )
    story_text = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        trim_whitespace=False,
        max_length=MAX_STORY_LENGTH,
    )
    publication_choice = serializers.ChoiceField(choices=PublicationChoice.choices)

    publication_consent = serializers.BooleanField(default=False)
    statistics_consent = serializers.BooleanField(default=False)

    def validate_age_group(self, value):
        if value not in AGE_GROUPS:
            raise serializers.ValidationError("Invalid age group.")
        return value

    def validate_setting(self, value):
        if value not in SETTINGS:
            raise serializers.ValidationError("Invalid setting.")
        return value

    def validate_experience_types(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Duplicate experience types are not allowed.")
        if any(item not in EXPERIENCE_TYPES for item in value):
            raise serializers.ValidationError("Invalid experience type.")
        if "prefer_not" in value and len(value) > 1:
            raise serializers.ValidationError(
                "Prefer-not-to-say cannot be combined with specific experience types."
            )
        return value

    def validate_frequency(self, value):
        if value not in FREQUENCIES:
            raise serializers.ValidationError("Invalid frequency.")
        return value

    def validate(self, attrs):
        choice = attrs["publication_choice"]
        story = attrs["story_text"]

        if choice == PublicationChoice.PUBLIC:
            if not attrs["publication_consent"]:
                raise serializers.ValidationError(
                    {"publication_consent": "Explicit publication consent is required."}
                )
            if not story.strip():
                raise serializers.ValidationError(
                    {"story_text": "Story text is required for the public-story path."}
                )

        if choice == PublicationChoice.STATISTICS_ONLY and not attrs["statistics_consent"]:
            raise serializers.ValidationError(
                {"statistics_consent": "Explicit statistics consent is required."}
            )

        return attrs
