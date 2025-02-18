source venv/bin/activatepip
install -r requirements_test_app.txt

voor help/uitleg; django-admin [command]--help

starting;

python(python interpreter) manage.py runserver [port]

about simple default django database;
for inspecting db.sqlite3;
sudo apt install sqlite3

dont forget;
py manage.py migrate - django modules naar database
makemigration - eigen modules toevoegen in de database

manual POST request for testing;



ORM  python objects -> relational database
https://www.fullstackpython.com/img/visuals/orms-bridge.png

bronnen;
https://www.sqlite.org/whentouse.html


https://medium.com/@extio/understanding-json-web-tokens-jwt-a-secure-approach-to-web-authentication-f551e8d66deb
https://django-rest-registration.readthedocs.io/en/latest/detailed_configuration/register.html
https://www.freecodecamp.org/news/how-to-use-jwt-and-django-rest-framework-to-get-tokens/