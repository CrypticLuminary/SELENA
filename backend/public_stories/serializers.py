from rest_framework import serializers

from submissions.taxonomy import (
    AGE_GROUPS,
    EXPERIENCE_TYPES,
    SETTINGS,
)

from .policy import MAX_PUBLIC_EXCERPT_LENGTH, PUBLIC_RELATIONSHIPS, REPORT_REASONS


class StrictSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Expected an object.")

        unknown = set(data) - set(self.fields)
        if unknown:
            raise serializers.ValidationError(
                {"non_field_errors": ["Unknown fields are not accepted."]}
            )
        return super().to_internal_value(data)


class PublicationInputSerializer(StrictSerializer):
    """
    Explicit public projection chosen at publication time.

    The service verifies these values can only suppress or reduce the private
    submission; serializer choices alone are not an authorization boundary.
    """

    age_group = serializers.ChoiceField(choices=sorted(AGE_GROUPS))
    relationship = serializers.ChoiceField(choices=sorted(PUBLIC_RELATIONSHIPS))
    setting = serializers.ChoiceField(choices=sorted(SETTINGS))
    experience_types = serializers.ListField(
        child=serializers.ChoiceField(choices=sorted(EXPERIENCE_TYPES)),
        min_length=1,
        max_length=len(EXPERIENCE_TYPES),
    )
    excerpt = serializers.CharField(
        max_length=MAX_PUBLIC_EXCERPT_LENGTH,
        trim_whitespace=True,
    )


class StoryReportInputSerializer(StrictSerializer):
    reason = serializers.ChoiceField(choices=sorted(REPORT_REASONS))


class PublicStoryFilterSerializer(serializers.Serializer):
    relationship = serializers.ChoiceField(
        choices=sorted(PUBLIC_RELATIONSHIPS),
        required=False,
    )
    setting = serializers.ChoiceField(choices=sorted(SETTINGS), required=False)
    age_group = serializers.ChoiceField(choices=sorted(AGE_GROUPS), required=False)
    experience_type = serializers.ChoiceField(
        choices=sorted(EXPERIENCE_TYPES),
        required=False,
    )
    sort = serializers.ChoiceField(choices=["recent", "featured"], required=False)
    cursor = serializers.UUIDField(required=False)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=50)


class PublicStoryListSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    alias = serializers.CharField()
    age_group = serializers.CharField()
    relationship = serializers.CharField()
    setting = serializers.CharField()
    experience_types = serializers.ListField(child=serializers.CharField())
    warnings = serializers.ListField(child=serializers.CharField())
    excerpt = serializers.CharField()
    published_label = serializers.SerializerMethodField()
    featured = serializers.BooleanField()

    def get_published_label(self, obj):
        return f"Shared in {obj.published_at.year}"


class PublicStoryDetailSerializer(PublicStoryListSerializer):
    content = serializers.CharField()
