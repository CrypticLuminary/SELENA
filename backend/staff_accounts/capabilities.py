from __future__ import annotations

from django.contrib.auth.models import Permission

from .models import StaffRole


class StaffCapability:
    VIEW_RAW_SUBMISSION = "view_raw_submission"
    CLAIM_MODERATION_CASE = "claim_moderation_case"
    EDIT_REDACTION = "edit_redaction"
    DECIDE_MODERATION_CASE = "decide_moderation_case"
    HANDLE_ESCALATED_MODERATION = "handle_escalated_moderation"
    PUBLISH_STORY = "publish_story"
    PUBLISH_STORY_DUAL_CONTROL = "publish_story_dual_control"
    REVIEW_ANALYTICS = "review_analytics"
    HANDLE_STORY_REPORT = "handle_story_report"
    PROCESS_REMOVAL = "process_removal"
    MANAGE_STAFF_ACCESS = "manage_staff_access"
    BREAK_GLASS_RAW_ACCESS = "break_glass_raw_access"


ROLE_CAPABILITY_TEMPLATES = {
    StaffRole.MODERATOR: {
        StaffCapability.VIEW_RAW_SUBMISSION,
        StaffCapability.CLAIM_MODERATION_CASE,
        StaffCapability.EDIT_REDACTION,
        StaffCapability.DECIDE_MODERATION_CASE,
        StaffCapability.PUBLISH_STORY,
        StaffCapability.HANDLE_STORY_REPORT,
    },
    StaffRole.SENIOR_MODERATOR: {
        StaffCapability.VIEW_RAW_SUBMISSION,
        StaffCapability.CLAIM_MODERATION_CASE,
        StaffCapability.EDIT_REDACTION,
        StaffCapability.DECIDE_MODERATION_CASE,
        StaffCapability.HANDLE_ESCALATED_MODERATION,
        StaffCapability.PUBLISH_STORY,
        StaffCapability.PUBLISH_STORY_DUAL_CONTROL,
        StaffCapability.HANDLE_STORY_REPORT,
        StaffCapability.PROCESS_REMOVAL,
    },
    StaffRole.ANALYST: {
        StaffCapability.REVIEW_ANALYTICS,
    },
    StaffRole.OPERATIONS_SAFETY: {
        StaffCapability.HANDLE_STORY_REPORT,
        StaffCapability.PROCESS_REMOVAL,
    },
    StaffRole.SUPERADMIN: {
        StaffCapability.MANAGE_STAFF_ACCESS,
    },
}


def _staff_permission_queryset():
    return Permission.objects.filter(
        content_type__app_label="staff_accounts",
        content_type__model="staffuser",
    )


def capability_codenames(user) -> set[str]:
    """Return explicit SELENA capabilities without Django superuser bypass."""
    if not user or not user.is_authenticated or not user.is_active or not user.is_staff:
        return set()

    direct = set(
        user.user_permissions.filter(
            content_type__app_label="staff_accounts",
            content_type__model="staffuser",
        ).values_list("codename", flat=True)
    )
    grouped = set(
        Permission.objects.filter(
            content_type__app_label="staff_accounts",
            content_type__model="staffuser",
            group__user=user,
        ).values_list("codename", flat=True)
    )
    return direct | grouped


def staff_has_capability(user, capability: str) -> bool:
    return capability in capability_codenames(user)


def apply_role_template(user) -> set[str]:
    """
    Provision the explicit capability bundle for the user's role.

    The role is a setup template, not an authorization fallback. Calling this
    function intentionally replaces the user's direct SELENA capability set.
    Additional multi-role access should be represented by explicit permissions
    or groups rather than changing authorization code to inspect role labels.
    """
    codenames = ROLE_CAPABILITY_TEMPLATES.get(user.role, set())
    permissions = list(_staff_permission_queryset().filter(codename__in=codenames))
    user.user_permissions.set(permissions)
    return {permission.codename for permission in permissions}
