from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsActiveStaff


class StaffMeView(APIView):
    permission_classes = [IsActiveStaff]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": str(user.pk),
                "username": user.get_username(),
                "role": user.role,
            }
        )
