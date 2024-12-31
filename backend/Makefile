# Only to be used in development environment

apps := django_axor_auth expense_tracker

.PHONY: venv resetdb superuser getready run su

venv:
	rm -rf .venv
	python3 -m venv .venv
	.venv/bin/python -m pip install -r requirements.txt

resetdb:
	rm -f ./db.sqlite3
	find . -type d -name migrations -prune -not -path "./.venv/*" -exec rm -rf {} \;
	.venv/bin/python manage.py makemigrations $(apps)
	.venv/bin/python manage.py migrate

superuser:
	.venv/bin/python manage.py createsuperuser

getready: venv resetdb

run:
	.venv/bin/python manage.py runserver 0.0.0.0:8000

su:
	.venv/bin/python manage.py createsuperuser
