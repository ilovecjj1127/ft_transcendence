from django.contrib import admin
from .models import Game, Tournament, TournamentPlayer

admin.site.register(Game)
admin.site.register(Tournament)
admin.site.register(TournamentPlayer)

# Register your models here.
