from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CrossBreakdownQuerySerializer
from .services import latest_snapshot


def _public_response(data, *, status_code=status.HTTP_200_OK):
    response = Response(data, status=status_code)
    response["Cache-Control"] = "no-store"
    response["Pragma"] = "no-cache"
    response["X-Robots-Tag"] = "noindex"
    return response


def _snapshot_or_unavailable():
    return latest_snapshot()


class PatternSnapshotView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        snapshot = _snapshot_or_unavailable()
        if snapshot is None:
            return _public_response(
                {"detail": "Patterns are not available yet."},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return _public_response(
            {
                "dataset_version": snapshot.dataset_version,
                "privacy_policy_version": snapshot.privacy_policy_version,
                "generated_label": snapshot.generated_label,
                "total_band": snapshot.total_band or None,
                "distributions": snapshot.payload["distributions"],
            }
        )


class ComparableRelationshipsView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        snapshot = _snapshot_or_unavailable()
        if snapshot is None:
            return _public_response(
                {"detail": "Patterns are not available yet."},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return _public_response(
            {
                "dataset_version": snapshot.dataset_version,
                "privacy_policy_version": snapshot.privacy_policy_version,
                "values": snapshot.payload["comparable_relationships"],
            }
        )


class CrossBreakdownView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        serializer = CrossBreakdownQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        values = serializer.validated_data

        snapshot = _snapshot_or_unavailable()
        if snapshot is None:
            return _public_response(
                {"detail": "Patterns are not available yet."},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        result = snapshot.payload["cross"][values["category"]][values["secondary"]]
        return _public_response(
            {
                "dataset_version": snapshot.dataset_version,
                "privacy_policy_version": snapshot.privacy_policy_version,
                **result,
            }
        )
