## quickstart for testing

cd app/

# make virtual env;
virtualenv newenv

source newenv/bin/activate

pip install -r requirements_test_app.txt

# start server

python manage.py runserver


get list of all users from database;
curl -X GET http://127.0.0.1:8000/api/users/ -H "Authorization: Bearer [insert jwt access token]"

access token u can copy from browser->networktab->response header

