"""
Package principal de l'API Fultang Hospital.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .celery import app as celery_app

__all__ = ('celery_app',)
