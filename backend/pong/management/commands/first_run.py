from django.core.management.base import BaseCommand

from users.models import UserProfile, FriendshipRequest
from games.models import Game, Tournament, TournamentPlayer
from chat.models import ChatRoom


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
        if not UserProfile.objects.filter(username='cathy').exists():
            user3 = UserProfile.objects.create_user(
                username='cathy',
                password='cathy'
            )
        if not UserProfile.objects.filter(username='david').exists():
            user4 = UserProfile.objects.create_user(
                username='david',
                password='david'
            )
        
        #Create test games
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
        
        # Create test tournament
        if user1 and user2 and user3 and user4:
            tournament = Tournament.objects.create(
                name='first_tournament',
                creator=user1
            )
            TournamentPlayer.objects.create(
                tournament=tournament,
                player=user1,
                alias=user1.username+'_alias'
            )
            TournamentPlayer.objects.create(
                tournament=tournament,
                player=user3,
                alias=user3.username+'_alias'
            )

        # Create test chat room
        if user1 and user2:
            ChatRoom.objects.create(
                user1=user1,
                user2=user2
            )

        # Add friends
        if user1 and user2:
            FriendshipRequest.objects.create(from_user=user1, to_user=user2, status='accepted')
            user1.friends.add(user2)

        self.stdout.write('Creating DB objects...')

        self.stdout.write(self.style.SUCCESS('Initialization complete!'))
