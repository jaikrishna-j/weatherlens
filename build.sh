#!/usr/bin/env bash
set -euo pipefail

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running database migrations..."
python WeatherLens/manage.py migrate --noinput

echo "Collecting static files..."
python WeatherLens/manage.py collectstatic --noinput

echo "Ensuring admin user exists..."
python WeatherLens/manage.py bootstrap_superuser

