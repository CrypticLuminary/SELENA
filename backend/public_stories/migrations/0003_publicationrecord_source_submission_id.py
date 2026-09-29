from django.db import migrations, models


def backfill_source_submission_ids(apps, schema_editor):
    PublicationRecord = apps.get_model("public_stories", "PublicationRecord")
    ModerationCase = apps.get_model("moderation", "ModerationCase")

    for record in PublicationRecord.objects.filter(source_submission_id__isnull=True).iterator():
        try:
            case = ModerationCase.objects.only("submission_id").get(pk=record.source_case_id)
        except ModerationCase.DoesNotExist as exc:
            raise RuntimeError(
                "Cannot backfill publication source submission ID; "
                "the source moderation case is missing."
            ) from exc

        record.source_submission_id = case.submission_id
        record.save(update_fields=["source_submission_id"])


class Migration(migrations.Migration):
    dependencies = [
        ("moderation", "0001_initial"),
        ("public_stories", "0002_publicremovalcredential"),
    ]

    operations = [
        migrations.AddField(
            model_name="publicationrecord",
            name="source_submission_id",
            field=models.UUIDField(blank=True, db_index=True, null=True),
        ),
        migrations.RunPython(
            backfill_source_submission_ids,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="source_submission_id",
            field=models.UUIDField(db_index=True),
        ),
    ]
