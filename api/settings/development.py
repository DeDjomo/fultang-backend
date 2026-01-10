"""
Configuration Django pour l'environnement de developpement.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']  # Accepter toutes les origines

# Applications de developpement (rest_framework et corsheaders sont deja dans base.py)
INSTALLED_APPS += [
    'django_extensions',
]

# CORS Configuration - Complètement ouvert pour les tests
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ['*']
CORS_ALLOW_METHODS = ['*']

# Force email logging to console in development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# En développement, autoriser l'accès sans authentification pour faciliter les tests
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', # Reverting to secure default
    ],
}

# Désactiver le CSRF pour les tests
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:9000',
    'http://localhost:5173',
]
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False
