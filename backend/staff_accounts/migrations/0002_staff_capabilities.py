from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("staff_accounts", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="staffuser",
            options={
                "permissions": [
                    ("view_raw_submission", "Can view raw survivor submissions"),
                    ("claim_moderation_case", "Can claim moderation cases"),
                    ("edit_redaction", "Can create privacy redaction drafts"),
                    ("decide_moderation_case", "Can decide moderation cases"),
                    (
                        "handle_escalated_moderation",
                        "Can handle escalated moderation cases",
                    ),
                    ("publish_story", "Can publish an approved story"),
                    (
                        "publish_story_dual_control",
                        "Can perform final publication under dual control",
                    ),
                    ("review_analytics", "Can review approved analytics operations"),
                    ("handle_story_report", "Can handle public story reports"),
                    ("process_removal", "Can process verified removal requests"),
                    ("manage_staff_access", "Can manage staff access"),
                    (
                        "break_glass_raw_access",
                        "Can perform audited emergency raw access",
                    ),
                ]
            },
        ),
    ]
