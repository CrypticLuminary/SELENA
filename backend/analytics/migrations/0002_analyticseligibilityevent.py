import uuid

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("analytics", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="AnalyticsEligibilityEvent",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "source_submission_id",
                    models.UUIDField(db_index=True, editable=False),
                ),
                (
                    "action",
                    models.CharField(
                        choices=[
                            ("exclude", "Exclude from future snapshots"),
                            ("restore", "Restore future snapshot eligibility"),
                        ],
                        editable=False,
                        max_length=16,
                    ),
                ),
                (
                    "reason_code",
                    models.CharField(
                        choices=[
                            ("spam", "Technical spam"),
                            ("out_of_scope", "Outside declared platform scope"),
                            ("abuse_duplicate", "Confirmed abusive duplicate"),
                            ("abuse_automation", "Confirmed automated abuse"),
                            ("operator_correction", "Correction of a prior eligibility decision"),
                        ],
                        editable=False,
                        max_length=32,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                (
                    "actor",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="analytics_eligibility_events",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["created_at"],
                "indexes": [
                    models.Index(
                        fields=["source_submission_id", "-created_at"],
                        name="analytics_elig_source_created",
                    )
                ],
            },
        ),
    ]
