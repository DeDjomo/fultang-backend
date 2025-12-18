"""
Package models pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .service import Service
from .personnel import Personnel
from .medecin import Medecin
from .chambre import Chambre
from .admin import Admin

__all__ = ['Service', 'Personnel', 'Medecin', 'Chambre', 'Admin']
