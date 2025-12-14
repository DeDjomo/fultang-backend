"""
Package serializers pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .admin_serializers import AdminSerializer
from .service_serializers import (
    ServiceSerializer,
    ServiceCreateSerializer,
    PersonnelSerializer,
    MedecinSerializer,
)

__all__ = [
    'AdminSerializer',
    'ServiceSerializer',
    'ServiceCreateSerializer',
    'PersonnelSerializer',
    'MedecinSerializer',
]
