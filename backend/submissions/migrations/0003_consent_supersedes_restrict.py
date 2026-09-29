# Generated manually for the retention/audit deletion semantic fix.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("submissions", "0002_submissiondeletiontombstone"),
    ]

    operations = [
        migrations.AlterField(
            model_name="consentrecord",
            name="supersedes",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name="superseded_by",
                to="submissions.consentrecord",
            ),
        ),
    ]
