from django.core.management.base import BaseCommand
from django.utils import timezone

from analytics.models import AnalyticsContribution


class Command(BaseCommand):
    help = "Delete expired minimized analytics contributions."

    def handle(self, *args, **options):
        AnalyticsContribution.objects.filter(retention_expires_at__lte=timezone.now()).delete()
        self.stdout.write(self.style.SUCCESS("Expired analytics contributions purged."))
