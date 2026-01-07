"""
Configuration de l'application API.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
from django.apps import AppConfig


class ApiConfig(AppConfig):
    """Configuration de l'application API."""
    
    name = 'api'
    verbose_name = 'API Fultang Hospital'

    def ready(self):
        """
        Appelé quand Django est prêt.
        C'est ici qu'on importe les signaux pour éviter AppRegistryNotReady.
        """
        try:
            from api import signals  # noqa: F401
        except ImportError:
            pass
