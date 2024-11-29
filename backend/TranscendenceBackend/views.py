from django.http import HttpResponse
from django.shortcuts import render


def index(request):
    # return HttpResponse("Hello World!")
	return render(request, 'index.html')
