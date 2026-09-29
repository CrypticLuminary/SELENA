from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


def env(name: str, default: str | None = None) -> str:
    value = os.environ.get(name, default)
    if value is None:
        raise RuntimeError(f"Required environment variable {name} is not set")
    return value


def env_bool(name: str, default: bool = False) -> bool:
    return env(name, "true" if default else "false").lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in env(name, default).split(",") if item.strip()]


SECRET_KEY = env("DJANGO_SECRET_KEY", "development-only-unsafe-secret")
DEBUG = False
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "core",
    "staff_accounts",
    "submissions",
    "privacy_review",
    "moderation",
    "public_stories",
    "analytics",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "selena_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "selena_api.wsgi.application"
ASGI_APPLICATION = "selena_api.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "selena"),
        "USER": env("POSTGRES_USER", "selena"),
        "PASSWORD": env("POSTGRES_PASSWORD", "selena-development-only"),
        "HOST": env("POSTGRES_HOST", "127.0.0.1"),
        "PORT": env("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": int(env("POSTGRES_CONN_MAX_AGE", "0")),
    }
}

AUTH_USER_MODEL = "staff_accounts.StaffUser"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    # Secure-by-default: future public views must opt into AllowAny explicitly.
    "DEFAULT_PERMISSION_CLASSES": ["staff_accounts.permissions.IsActiveStaff"],
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.SessionAuthentication"],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "EXCEPTION_HANDLER": "core.exceptions.safe_exception_handler",
    "DEFAULT_THROTTLE_RATES": {
        "submission": env("SUBMISSION_THROTTLE_RATE", "5/hour"),
        "story_report": env("STORY_REPORT_THROTTLE_RATE", "10/hour"),
    },
    # Zero means trust REMOTE_ADDR only. Production may set an explicit known
    # proxy count; never leave rate limiting dependent on arbitrary XFF input.
    "NUM_PROXIES": int(env("DRF_NUM_PROXIES", "0")),
}

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
X_FRAME_OPTIONS = "DENY"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "no-referrer"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

DATA_UPLOAD_MAX_MEMORY_SIZE = int(env("DJANGO_MAX_REQUEST_BYTES", str(256 * 1024)))
FILE_UPLOAD_MAX_MEMORY_SIZE = DATA_UPLOAD_MAX_MEMORY_SIZE
PENDING_SUBMISSION_RETENTION_DAYS = int(env("PENDING_SUBMISSION_RETENTION_DAYS", "90"))
STATISTICS_ONLY_RETENTION_DAYS = int(env("STATISTICS_ONLY_RETENTION_DAYS", "730"))
ANALYTICS_CONTRIBUTION_RETENTION_DAYS = int(env("ANALYTICS_CONTRIBUTION_RETENTION_DAYS", "730"))
REJECTED_SUBMISSION_RETENTION_DAYS = int(env("REJECTED_SUBMISSION_RETENTION_DAYS", "30"))
PUBLISHED_RAW_RETENTION_DAYS = int(env("PUBLISHED_RAW_RETENTION_DAYS", "30"))
PUBLICATION_CONTROL_MODE = env("PUBLICATION_CONTROL_MODE", "disabled")
DELETION_TOMBSTONE_RETENTION_DAYS = int(env("DELETION_TOMBSTONE_RETENTION_DAYS", "1095"))

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "sensitive_data": {"()": "core.logging.SensitiveDataFilter"},
    },
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "filters": ["sensitive_data"],
            "formatter": "standard",
        }
    },
    "root": {"handlers": ["console"], "level": env("DJANGO_LOG_LEVEL", "INFO")},
    "loggers": {
        "django.request": {
            "handlers": ["console"],
            "level": env("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        }
    },
}
