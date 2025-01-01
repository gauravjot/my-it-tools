from decouple import config
from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DJANGO_DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = ['*']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_axor_auth',
    'django_axor_auth.web_auth',

    'rest_framework',
    'expense_tracker'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # Apply on request
    # # required
    "django_axor_auth.middlewares.HeaderRequestedByMiddleware",
    "django_axor_auth.users.middlewares.ActiveUserMiddleware",
    # # optional
    "django_axor_auth.extras.middlewares.VerifyRequestOriginMiddleware",
    "django_axor_auth.extras.middlewares.ValidateJsonMiddleware",

    # Apply on response
    "django_axor_auth.logs.middlewares.APILogMiddleware",
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Axor
AXOR_AUTH = dict(
    # General
    APP_NAME="My Toolkit",
    FRONTEND_URL=config('BACKEND_URL', default='http://localhost:8000'),
    URI_PREFIX="/api",  # URI prefix for all API endpoints

    # Cookies
    AUTH_COOKIE_NAME='toolkit_auth',
    AUTH_COOKIE_AGE=60 * 60 * 24 * 90,  # 90 days
    AUTH_COOKIE_SECURE=True,
    AUTH_COOKIE_SAMESITE='Strict',
    AUTH_COOKIE_DOMAIN=config('AUTH_COOKIE_DOMAIN', default='.localhost'),

    # Email
    SMTP_USE_TLS=config('SMTP_USE_TLS', default=True, cast=bool),
    SMTP_USE_SSL=config('SMTP_USE_SSL', default=False, cast=bool),
    SMTP_HOST=config('SMTP_HOST', default=None),
    SMTP_PORT=config('SMTP_PORT', default=None),
    SMTP_USER=config('SMTP_USER', default=None),
    SMTP_PASSWORD=config('SMTP_PASSWORD', default=None),
    SMTP_DEFAULT_SEND_FROM=config('SMTP_DEFAULT_SEND_FROM', default=None),
)
# Set the origins that Axor API will respond to.
# To set all origins, use value ['*']
ALLOW_ORIGINS = [config('FRONTEND_URL')]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
        },
    },
}

# CORS
CORS_ALLOWED_ORIGINS = [
    config('FRONTEND_URL', default='http://localhost:5173'),
]
CORS_ORIGIN_WHITELIST = CORS_ALLOWED_ORIGINS
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = (
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
)

CORS_ALLOW_CREDENTIALS = True


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

def get_database():
    host = config('DB_HOST', default=None)
    if host is None or len(host) == 0:
        Path(str(BASE_DIR) + "/db").mkdir(parents=True, exist_ok=True)
        return {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db' / 'db.sqlite3',
            }
        }
    else:
        return {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': config('DB_NAME'),
                'USER': config('DB_USERNAME'),
                'PASSWORD': config('DB_PASSWORD'),
                'HOST': config('DB_HOST'),
                'PORT': config('DB_PORT'),
            }
        }


DATABASES = get_database()


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
