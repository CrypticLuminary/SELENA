from django.core.management.base import BaseCommand

from analytics.services import generate_snapshot


class Command(BaseCommand):
    help = "Generate one frozen privacy-safe public analytics snapshot."

    def handle(self, *args, **options):
        snapshot = generate_snapshot()
        self.stdout.write(
            self.style.SUCCESS(
                f"Generated privacy-safe analytics snapshot {snapshot.dataset_version}."
            )
        )
