from django.core.management.base import BaseCommand
from django.utils import timezone

from submissions.models import SubmissionDeletionTombstone


class Command(BaseCommand):
    help = "Delete deletion tombstones after their configured retention period."

    def handle(self, *args, **options):
        expired = SubmissionDeletionTombstone.objects.filter(
            retention_expires_at__lte=timezone.now()
        )
        count = expired.count()
        expired.delete()
        self.stdout.write(self.style.SUCCESS(f"Purged {count} expired deletion tombstone(s)."))
