#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN=${PYTHON_BIN:-python}

echo "Installing dependencies..."
$PYTHON_BIN -m pip install --upgrade pip
$PYTHON_BIN -m pip install -r requirements.txt

echo "Running database migrations..."
$PYTHON_BIN WeatherLens/manage.py migrate --noinput

echo "Collecting static files..."
$PYTHON_BIN WeatherLens/manage.py collectstatic --noinput

echo "Ensuring admin user exists..."
$PYTHON_BIN WeatherLens/manage.py bootstrap_superuser || echo "Superuser creation skipped (may already exist)"

echo "Build steps completed."

