from django.db import models

# Create your models here.
class Game(models.Model):
    result = models.CharField(max_length=32)
    status = models.CharField(max_length=32)

    def __str__(self):
        return f"Game {self.id}"
