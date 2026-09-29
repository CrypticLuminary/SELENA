from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submissions", "0003_consent_supersedes_restrict"),
    ]

    operations = [
        migrations.AlterField(
            model_name="rawsubmission",
            name="state",
            field=models.CharField(
                choices=[
                    ("received", "Received"),
                    ("needs_review", "Needs review"),
                    ("approved", "Approved"),
                    ("rejected", "Rejected"),
                ],
                default="received",
                editable=False,
                max_length=24,
            ),
        ),
    ]
