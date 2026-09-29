from django.db import migrations, models


CONSENT_PURPOSE_PUBLICATION = "publication"


def backfill_publication_consent_provenance(apps, schema_editor):
    PublicationRecord = apps.get_model("public_stories", "PublicationRecord")
    ConsentRecord = apps.get_model("submissions", "ConsentRecord")

    for record in PublicationRecord.objects.all().iterator():
        consent = (
            ConsentRecord.objects.filter(
                submission_id=record.source_submission_id,
                purpose=CONSENT_PURPOSE_PUBLICATION,
                granted=True,
                recorded_at__lte=record.created_at,
            )
            .order_by("-recorded_at")
            .first()
        )
        if consent is None:
            raise RuntimeError(
                "Cannot backfill publication consent provenance; "
                "the granted source consent evidence is missing."
            )

        record.publication_consent_record_id = consent.id
        record.publication_consent_text_version = consent.consent_text_version
        record.publication_consent_privacy_policy_version = consent.privacy_policy_version
        record.publication_consent_schema_version = consent.schema_version
        record.publication_consent_source_flow_version = consent.source_flow_version
        record.publication_consent_recorded_at = consent.recorded_at
        record.save(
            update_fields=[
                "publication_consent_record_id",
                "publication_consent_text_version",
                "publication_consent_privacy_policy_version",
                "publication_consent_schema_version",
                "publication_consent_source_flow_version",
                "publication_consent_recorded_at",
            ]
        )


class Migration(migrations.Migration):
    dependencies = [
        ("public_stories", "0003_publicationrecord_source_submission_id"),
        ("submissions", "0004_rawsubmission_moderation_states"),
    ]

    operations = [
        migrations.AddField(
            model_name="publicationrecord",
            name="publication_consent_record_id",
            field=models.UUIDField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="publicationrecord",
            name="publication_consent_text_version",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="publicationrecord",
            name="publication_consent_privacy_policy_version",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="publicationrecord",
            name="publication_consent_schema_version",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="publicationrecord",
            name="publication_consent_source_flow_version",
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name="publicationrecord",
            name="publication_consent_recorded_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(
            backfill_publication_consent_provenance,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="publication_consent_record_id",
            field=models.UUIDField(),
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="publication_consent_text_version",
            field=models.CharField(max_length=64),
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="publication_consent_privacy_policy_version",
            field=models.CharField(max_length=64),
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="publication_consent_schema_version",
            field=models.CharField(max_length=64),
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="publication_consent_source_flow_version",
            field=models.CharField(max_length=64),
        ),
        migrations.AlterField(
            model_name="publicationrecord",
            name="publication_consent_recorded_at",
            field=models.DateTimeField(),
        ),
    ]
