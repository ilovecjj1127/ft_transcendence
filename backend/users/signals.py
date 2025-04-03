from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_migrate)
def create_friendship(sender, **kwargs):
    if sender.name == "users":  # Run only for "users" app
        # boba, created = User.objects.get_or_create(username="boba", password="boba", defaults={"email": "boba@example.com"})
        # davida, created = User.objects.get_or_create(username="davida", password="davida", defaults={"email": "davida@example.com"})

        # # Ensure they are friends
        # Friendship.objects.get_or_create(user1=bob, user2=david)
        # print("✅ Bob and David are now friends!")
		# Ensure they are friends
        # if davida not in davida.friends.all():
        #     boba.friends.add(davida)
        #     davida.friends.add(boba)
        #     print("✅ Boba and Davida are now friends!")
        #     print(davida.friends.all())
            
        # cathy = User.objects.get(username="cathy")
        # print(cathy)
        # alice = User.objects.get(username="alice")
        # print(alice)
        # print(alice.friends.all())
        # alice.friends.add(cathy)
        # cathy.friends.add(alice)
        # print(alice.friends.all())
        
        david = User.objects.get(username="david")
        print(david)
        bob = User.objects.get(username="bob")
        print(bob)
        print(bob.friends.all())
        bob.friends.add(david)
        david.friends.add(bob)
        print(bob.friends.all())



