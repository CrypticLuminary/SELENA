from rest_framework import status
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AnonymousSubmissionSerializer
from .services import create_anonymous_submission
from .throttles import SubmissionAnonThrottle


class AnonymousSubmissionView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    throttle_classes = [SubmissionAnonThrottle]

    def post(self, request):
        serializer = AnonymousSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        receipt = create_anonymous_submission(dict(serializer.validated_data))

        response = Response(
            {
                "received": True,
                "removal_code": receipt.removal_code,
                "publication_choice": receipt.publication_choice,
            },
            status=status.HTTP_201_CREATED,
        )
        # The response contains the only plaintext copy of the removal credential.
        response["Cache-Control"] = "no-store"
        response["Pragma"] = "no-cache"
        return response
