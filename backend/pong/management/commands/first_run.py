from django.core.management.base import BaseCommand

from users.models import UserProfile
from games.models import Game


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
        user1, user2 = None, None
        if not UserProfile.objects.filter(username='alice').exists():
            self.stdout.write('Creating test users...')
            user1 = UserProfile.objects.create_user(
                username='alice',
                password='alice'
            )
        if not UserProfile.objects.filter(username='bob').exists():
            user2 = UserProfile.objects.create_user(
                username='bob',
                password='bob'
            )
        
        #Crate test games
        if user1 and user2:
            Game.objects.create(
                player1=user1,
                status='pending'
            )
            Game.objects.create(
                player1=user1,
                player2=user2,
                status='ready'
            )

        self.stdout.write('Creating DB objects...')

        self.stdout.write(self.style.SUCCESS('Initialization complete!'))
