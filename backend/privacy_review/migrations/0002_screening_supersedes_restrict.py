import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("privacy_review", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="privacyscreening",
            name="supersedes",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name="superseded_by",
                to="privacy_review.privacyscreening",
            ),
        ),
    ]
