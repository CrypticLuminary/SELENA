from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from submissions.models import (
    RawSubmission,
    SubmissionDeletionReason,
    SubmissionDeletionTombstone,
)


class Command(BaseCommand):
    help = "Delete expired private submissions and record minimal deletion tombstones."

    def handle(self, *args, **options):
        now = timezone.now()

        with transaction.atomic():
            submission_ids = list(
                RawSubmission.objects.select_for_update()
                .filter(retention_expires_at__lte=now)
                .values_list("id", flat=True)
            )

            if submission_ids:
                tombstone_expiry = now + timedelta(days=settings.DELETION_TOMBSTONE_RETENTION_DAYS)
                SubmissionDeletionTombstone.objects.bulk_create(
                    [
                        SubmissionDeletionTombstone(
                            submission_id=submission_id,
                            reason=SubmissionDeletionReason.RETENTION_EXPIRED,
                            retention_expires_at=tombstone_expiry,
                        )
                        for submission_id in submission_ids
                    ],
                    ignore_conflicts=True,
                )
                RawSubmission.objects.filter(id__in=submission_ids).delete()

        self.stdout.write(
            self.style.SUCCESS(f"Purged {len(submission_ids)} expired private submission(s).")
        )
