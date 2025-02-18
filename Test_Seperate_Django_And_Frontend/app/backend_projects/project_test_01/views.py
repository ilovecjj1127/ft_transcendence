from django.http import HttpResponse
from django.shortcuts import render

from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse

@csrf_exempt
def login_view(request):
	try:
		data = json.loads(request.body)
		username = data.get("username")
		password = data.get("password")
		
		if username == "ad" and password == "123":
			return JsonResponse({"message": "Login is very succesfull", "token": "jwt_token", "return_value": 0})
		else:
			return JsonResponse({"message": "Login incorrect username and/or password man!!!", "token": "no token for you", "return_value": 1})

	except json.JSONDecodeError:
			return JsonResponse({"error": "invalid JSON Format", "return_value": 1})



def index(request):
	# return HttpResponse("Hello world")
	return render(request, 'index.html')
