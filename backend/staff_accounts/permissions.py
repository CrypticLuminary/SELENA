from rest_framework.permissions import BasePermission

from .capabilities import StaffCapability, staff_has_capability


class IsActiveStaff(BasePermission):
    """Require an authenticated, active Django staff account."""

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_staff)


class HasStaffCapability(BasePermission):
    capability: str

    def has_permission(self, request, view) -> bool:
        return staff_has_capability(request.user, self.capability)


class CanViewRawSubmission(HasStaffCapability):
    capability = StaffCapability.VIEW_RAW_SUBMISSION


class CanClaimModerationCase(HasStaffCapability):
    capability = StaffCapability.CLAIM_MODERATION_CASE


class CanEditRedaction(HasStaffCapability):
    capability = StaffCapability.EDIT_REDACTION


class CanDecideModerationCase(HasStaffCapability):
    capability = StaffCapability.DECIDE_MODERATION_CASE


class CanPublishStory(HasStaffCapability):
    capability = StaffCapability.PUBLISH_STORY
