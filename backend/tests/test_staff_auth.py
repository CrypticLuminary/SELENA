import pytest
from django.urls import reverse

from staff_accounts.capabilities import StaffCapability, apply_role_template
from staff_accounts.models import StaffRole, StaffUser


@pytest.mark.django_db
def test_staff_me_rejects_anonymous(client):
    response = client.get(reverse("staff-me"))
    assert response.status_code in {401, 403}


@pytest.mark.django_db
def test_staff_me_rejects_authenticated_nonstaff_account(client):
    user = StaffUser.objects.create_user(
        username="nonstaff",
        email="nonstaff@example.test",
        password="A-long-test-password-123!",
        is_staff=False,
    )
    client.force_login(user)

    response = client.get(reverse("staff-me"))

    assert response.status_code == 403


@pytest.mark.django_db
def test_staff_me_returns_minimal_authenticated_identity(client):
    user = StaffUser.objects.create_user(
        username="moderator1",
        email="moderator@example.test",
        password="A-long-test-password-123!",
        role=StaffRole.MODERATOR,
        is_staff=True,
    )
    apply_role_template(user)
    client.force_login(user)

    response = client.get(reverse("staff-me"))

    assert response.status_code == 200
    assert response.json() == {
        "id": str(user.pk),
        "username": "moderator1",
        "role": StaffRole.MODERATOR,
        "capabilities": sorted(
            [
                StaffCapability.VIEW_RAW_SUBMISSION,
                StaffCapability.CLAIM_MODERATION_CASE,
                StaffCapability.EDIT_REDACTION,
                StaffCapability.DECIDE_MODERATION_CASE,
                StaffCapability.PUBLISH_STORY,
                StaffCapability.HANDLE_STORY_REPORT,
            ]
        ),
    }
    assert "email" not in response.json()
