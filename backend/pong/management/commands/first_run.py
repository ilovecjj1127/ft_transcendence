from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from users.models import UserProfile


class Command(BaseCommand):
    help = "Run migrations and create superuser at first launch"

    def handle(self, *args, **kwargs):
        #Run migrations
        self.stdout.write('Applying migrations..')
        from django.core.management import call_command
        call_command('migrate')
        call_command('collectstatic')

        #Create superuser
        if not UserProfile.objects.filter(username='admin').exists():
            self.stdout.write('Creating superuser...')
            UserProfile.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin'
            )

        #Create test users
        if not UserProfile.objects.filter(username='alice').exists():
            self.stdout.write('Creating test users...')
            UserProfile.objects.create_user(
                username='alice',
                password='alice'
            )
        if not UserProfile.objects.filter(username='bob').exists():
            UserProfile.objects.create_user(
                username='bob',
                password='bob'
            )

        self.stdout.write('Creating DB objects...')

        self.stdout.write(self.style.SUCCESS('Initialization complete!'))
