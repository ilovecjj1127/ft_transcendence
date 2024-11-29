from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from pong.models import Game
from users.models import UserProfile


class Command(BaseCommand):
    help = "Run migrations and create superuser at first launch"

    def handle(self, *args, **kwargs):
        #Run migrations
        self.stdout.write('Applying migrations..')
        from django.core.management import call_command
        call_command('migrate')

        #Create superuser
        if not UserProfile.objects.filter(username='admin').exists():
            self.stdout.write('Creating superuser...')
            UserProfile.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin'
            )
        
        self.stdout.write('Creating DB objects...')
        Game.objects.create(result='Test Game object 1', status='new')

        self.stdout.write(self.style.SUCCESS('Initialization complete!'))
