#!/bin/bash

# Wait for the DB to be ready
echo "Waiting for database..."
while ! nc -z $DB_HOST $DB_PORT; do
    sleep 1
done
echo "Database is ready!"

# Prepare database from scratch
python manage.py first_run

# Start the Django server
exec "$@"
