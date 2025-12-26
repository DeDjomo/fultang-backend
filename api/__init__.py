"""
Package principal de l'API Fultang Hospital.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .celery import app as celery_app

__all__ = ('celery_app',)

# NOTE: Les signaux WebSocket sont importés dans api/apps.py via la méthode ready()
# Ne pas importer les signaux ici car Django n'est pas encore chargé
