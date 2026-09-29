from rest_framework import serializers

from submissions.taxonomy import PERSON_RELATIONSHIP_CATEGORIES

from .policy import CROSS_SECONDARIES


class StrictQuerySerializer(serializers.Serializer):
    def to_internal_value(self, data):
        unknown = set(data.keys()) - set(self.fields)
        if unknown:
            raise serializers.ValidationError(
                {"non_field_errors": ["Unknown query parameters are not accepted."]}
            )
        return super().to_internal_value(data)


class CrossBreakdownQuerySerializer(StrictQuerySerializer):
    primary = serializers.ChoiceField(choices=["relationship"])
    secondary = serializers.ChoiceField(choices=CROSS_SECONDARIES)
    category = serializers.ChoiceField(choices=sorted(PERSON_RELATIONSHIP_CATEGORIES))
