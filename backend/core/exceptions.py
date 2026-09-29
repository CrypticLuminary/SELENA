from rest_framework.response import Response
from rest_framework.views import exception_handler


def safe_exception_handler(exc, context):
    """Return normal DRF errors without ever echoing request bodies."""
    response = exception_handler(exc, context)
    if response is not None:
        return response

    # Unknown server errors are intentionally generic.
    return Response({"detail": "Internal server error."}, status=500)
