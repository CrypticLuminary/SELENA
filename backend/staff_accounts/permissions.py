from rest_framework.permissions import BasePermission


class IsActiveStaff(BasePermission):
    """Require an authenticated, active Django staff account."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_staff)
