"""
Package d'initialisation pour les settings Django.
"""
import os

settings_module = os.getenv('DJANGO_SETTINGS_MODULE', 'api.settings.development')

if settings_module == 'api.settings.development':
    from .development import *
elif settings_module == 'api.settings.production':
    from .production import *
elif settings_module == 'api.settings.testing':
    from .testing import *
else:
    from .development import *  # Fallback
