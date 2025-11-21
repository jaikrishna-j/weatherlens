#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def create_default_superuser():
    """
    Create the default deployment superuser if it does not already exist.
    Uses ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_EMAIL environment variables.
    """
    import django
    from django.core.management.utils import get_random_secret_key

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WeatherLens.settings')
    django.setup()

    from django.contrib.auth import get_user_model  # pylint: disable=import-error

    username = os.environ.get("ADMIN_USERNAME", "krish")
    password = os.environ.get("ADMIN_PASSWORD", "1234")
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com")

    User = get_user_model()

    if User.objects.filter(username=username).exists():
        print(f"Superuser '{username}' already exists. Skipping creation.")
        return

    if not password:
        password = get_random_secret_key()  # fallback to random password
        print(f"No ADMIN_PASSWORD provided; generated password: {password}")

    User.objects.create_superuser(username=username, password=password, email=email)
    print(f"Created superuser '{username}'.")


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WeatherLens.settings')

    if len(sys.argv) > 1 and sys.argv[1] == "bootstrap_superuser":
        create_default_superuser()
        return

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
