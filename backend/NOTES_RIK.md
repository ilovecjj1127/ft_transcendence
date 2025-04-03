# simple testing no docker;

virtualenv newenv

pip install -r req....txt

source newenv/bin/activate

use db.sqlite database in settings

python manage.py runserver





curl -X GET http://127.0.0.1/api/chat/get_or_create/ \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQzNjA1MjU0LCJpYXQiOjE3NDM2MDQzNTQsImp0aSI6ImFiYjA3YTU2OTg0ODRiYjc4OGQzYWZhNTY0ODA1NTI0IiwidXNlcl9pZCI6ImMyNDJjNTQxLWJkNzYtNDdmMS05NjhmLTY0ZWY0YjUwMzRkZiJ9.9L80PFCTyuFxYMeDjliyEqKlIyMr65xy9LlsPwDUF80" \
     -d '{"username": "cathy"}'