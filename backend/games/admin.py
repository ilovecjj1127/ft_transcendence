from django.contrib import admin
from .models import Game, Tournament, TournamentMatch

admin.site.register(Game)
admin.site.register(Tournament)
admin.site.register(TournamentMatch)

# Register your models here.
