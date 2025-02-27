# install
source venv/bin/activate
pip install -r requirements_test_app.txt

voor help/uitleg; django-admin [command]--help

# starting;

python(python interpreter) manage.py runserver [port]

about simple default django database;
for inspecting db.sqlite3;
sudo apt install sqlite3

dont forget;
py manage.py migrate - django modules naar database
makemigration - eigen modules toevoegen in de database

# use/testing

manual POST request for testing;

test register endpoint;
curl -X POST http://127.0.0.1:8000/api/register/
-H "Content-Type: application/json" -d
'{"username":"newuser",
"email":"newuser@example.com",
"password":"securepassword",
"password2":"securepassword"}'


get list of all users fromd database;
curl -X GET http://127.0.0.1:8000/api/users/ -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQwMDQzNjA1LCJpYXQiOjE3NDAwNDAwMDUsImp0aSI6IjUyMzEyN2FkODU1MjRhMmJiNGU3NTgwODFjM2I1ZjBhIiwidXNlcl9pZCI6MX0.fyo8uVXtS5v23uQajTdAy0oqD1EejUH61fEETIYBWII"


ORM  python objects -> relational database
https://www.fullstackpython.com/img/visuals/orms-bridge.png

## bronnen;
https://www.django-rest-framework.org/api-guide/views/#api_view
https://thomasstep.com/blog/a-guide-to-using-jwt-in-javascript`


https://www.sqlite.org/whentouse.html


https://medium.com/@extio/understanding-json-web-tokens-jwt-a-secure-approach-to-web-authentication-f551e8d66deb
https://django-rest-registration.readthedocs.io/en/latest/detailed_configuration/register.html
https://www.freecodecamp.org/news/how-to-use-jwt-and-django-rest-framework-to-get-tokens/

register and serializers;
https://iheanyi.com/journal/user-registration-authentication-with-django-django-rest-framework-react-and-redux/
https://www.django-rest-framework.org/api-guide/serializers/

# over tokens;
https://medium.com/django-unleashed/securing-django-rest-apis-with-jwt-authentication-using-simple-jwt-a-step-by-step-guide-28efa84666fe
https://www.descope.com/blog/post/developer-guide-jwt-storage
http://www.cyberchief.ai/2023/05/secure-jwt-token-storage.html
