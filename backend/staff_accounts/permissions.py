from rest_framework.permissions import BasePermission

from .models import StaffRole


class IsActiveStaff(BasePermission):
    """Require an authenticated, active Django staff account."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_staff)


class IsModerator(BasePermission):
    """Allow routine raw-content access only to moderation roles."""

    allowed_roles = {StaffRole.MODERATOR, StaffRole.SENIOR_MODERATOR}

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.is_staff
            and user.role in self.allowed_roles
        )
