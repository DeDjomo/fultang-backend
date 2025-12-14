"""
Configuration Django pour l'environnement de developpement.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

# Applications de developpement (rest_framework et corsheaders sont deja dans base.py)
INSTALLED_APPS += [
    'django_extensions',
]

CORS_ALLOW_ALL_ORIGINS = True
