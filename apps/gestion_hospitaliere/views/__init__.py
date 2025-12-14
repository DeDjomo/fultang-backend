"""
Package views pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .admin_views import AdminViewSet
from .service_views import ServiceViewSet

__all__ = ['AdminViewSet', 'ServiceViewSet']
