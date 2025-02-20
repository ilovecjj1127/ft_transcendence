from django.http import HttpResponse
from django.shortcuts import render

from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from rest_framework import serializers
from django.contrib.auth.models import User
from datetime import datetime
from rest_framework.renderers import JSONRenderer
from colorama import Fore, Style
from rest_framework.parsers import JSONParser
import io

# def register_view(request)

#created simple object
class Comment:
	def __init__(self, email, content, created=None):
		self.email = email
		self.content = content
		self.created = created or datetime.now()

comment = Comment(email="yes@testmail.com", content='foo bar')

#creates a serializer
class CommentSerializer(serializers.Serializer):
	email = serializers.EmailField()
	content = serializers.CharField(max_length=200)
	created = serializers.DateTimeField()

	#what for?
	def create(self, validated_data):
		return Comment(**validated_data)
	def update(self, instance, validated_data):
		instance.email = validated_data.get('email', instance.email)
		instance.content = validated_data.get('content', instance.content)
		instance.created = validated_data.get('created', instance.created)
		instance.save()
		return instance

def print_color(data, color):
	print(color)
	print(data)
	print(Style.RESET_ALL)

serializer = CommentSerializer(comment)

print_color("testprint comment object;", Fore.CYAN)
print(comment)
print_color("testprint serializer.data; converted to native python datatypes", Fore.CYAN)
print(serializer.data)

json_data = JSONRenderer().render(serializer.data)
#rendered into json format
print_color("testprint json_data; converted to json_data", Fore.CYAN)
print(json_data)

print_color("trying deserializing ", Fore.BLUE)

stream = io.BytesIO(json_data)
print_color("print stream ", Fore.BLUE)
print(stream)

data = JSONParser().parse(stream)
print_color("print data ", Fore.BLUE)
print(data)

serializer = CommentSerializer(data=data)

print(serializer.is_valid())
print(serializer.data)
# True
print(serializer.validated_data)
print_color("_________", Fore.BLUE)



print_color("register serializer and class_________", Fore.RED)

from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny

# userRegisterObject = Meta(email="yes@testmail.com", content='foo bar')


class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    email = serializers.EmailField(required=True)  # add this line
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# class UserRegisterView(APIView)
from rest_framework.views import APIView
# from .serializers import UserRegistrationSerializer
from rest_framework.response import Response
from rest_framework import status
# @csrf_exempt
class UserRegistrationView(APIView):
	permission_classes = [AllowAny]  # Allow anyone to register
	def post(self, request):
		print("hi from UserRegistration post")
		print(request.data)
		# print(request.header)

		serializer = UserRegistrationSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response({
			"message": "User registered successfully"
			}, status=status.HTTP_201_CREATED)
		# json_data = JSONRenderer().render(serializer)
		# print(json_data)
		# print_color(serializer.data, Fore.CYAN)
		print_color(serializer.errors, Fore.CYAN)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

print_color("_________", Fore.RED)



from rest_framework.permissions import IsAdminUser
from django.contrib.auth.models import User

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']  # customize fields as needed
        
class UserListView(APIView):
    # permission_classes = [IsAdminUser]  # Only admin users can access
    
    def get(self, request):
        users = User.objects.all()
        serializer = UserListSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from django.contrib.auth import authenticate

#fromchatgpt
class LoginSerializer(serializers.Serializer):
	username = serializers.CharField()
	password = serializers.CharField(write_only=True)  # write_only=True means it won't be sent back in responses
	print("hi from LoginSerializer")
	def validate(self, data):
		username = data.get('username')
		password = data.get('password')

		if username and password:
			user = authenticate(username=username, password=password)
			if user:
				if user.is_active:
					data['user'] = user
				else:
					raise serializers.ValidationError('User account is disabled.')
			else:
				raise serializers.ValidationError('Unable to log in with provided credentials.')
		else:
			raise serializers.ValidationError('Must include "username" and "password".')
		
		return data

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

#fromchatgpt
class LoginView(APIView):
	print("hi from LoginView post")
	permission_classes = [AllowAny]
	def post(self, request):
		print("hi from postmethod")
		serializer = LoginSerializer(data=request.data)
		if serializer.is_valid():
			user = serializer.validated_data['user']
			
			# Create JWT tokens
			refresh = RefreshToken.for_user(user)

			return Response({
				'refresh': str(refresh),
				'access': str(refresh.access_token),
				'user': {
					'id': user.id,
					'username': user.username,
					'email': user.email
				}
			}, status=status.HTTP_200_OK)
		print("Serializer errors:", serializer.errors)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# @csrf_exempt
# def login_view(request):
# 	try:
# 		data = json.loads(request.body)
# 		username = data.get("username")
# 		password = data.get("password")
		
# 		if username == "ad" and password == "123":
# 			return JsonResponse({"message": "Login is very succesfull", "token": "jwt_token", "return_value": 0})
# 		else:
# 			return JsonResponse({"message": "Login incorrect username and/or password man!!!", "token": "no token for you", "return_value": 1})

# 	except json.JSONDecodeError:
# 			return JsonResponse({"error": "invalid JSON Format", "return_value": 1})



def index(request):
	# return HttpResponse("Hello world")
	return render(request, 'index.html')
