from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

UserProfile = get_user_model()

class Command(BaseCommand):
    help = "Make all provided users friends with each other"

    def add_arguments(self, parser):
        parser.add_argument("usernames", nargs="+", type=str, help="List of usernames to become friends")

    def handle(self, *args, **options):
        usernames = options["usernames"]
        
        try:
            users = [UserProfile.objects.get(username=username) for username in usernames]
        except UserProfile.DoesNotExist as e:
            self.stderr.write(self.style.ERROR(f"Error: {str(e)}"))
            return

        for user in users:
            for friend in users:
                if user != friend and friend not in user.friends.all():
                    user.friends.add(friend)
        
        self.stdout.write(self.style.SUCCESS(f"✅ Friendship established among: {', '.join(usernames)}"))
