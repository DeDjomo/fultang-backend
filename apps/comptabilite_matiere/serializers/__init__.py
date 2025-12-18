"""
Sérialiseurs pour l'application comptabilite_matiere.
"""
from .besoin import (
    BesoinSerializer, 
    BesoinCreateSerializer, 
    BesoinUpdateSerializer,
    CommentaireDirecteurSerializer,
    ModifierStatutSerializer,
)
from .materiel import (
    MaterielSerializer,
    MaterielCreateSerializer,
    MaterielUpdateSerializer,
    MaterielMedicalSerializer,
    MaterielMedicalCreateSerializer,
    MaterielMedicalUpdateSerializer,
    MaterielDurableSerializer,
    MaterielDurableCreateSerializer,
    MaterielDurableUpdateSerializer,
)
from .livraison_sortie import (
    LivraisonSerializer,
    LivraisonCreateSerializer,
    LivraisonUpdateSerializer,
    SortieSerializer,
    SortieCreateSerializer,
    SortieUpdateSerializer,
)

__all__ = [
    # Besoin
    'BesoinSerializer',
    'BesoinCreateSerializer',
    'BesoinUpdateSerializer',
    'CommentaireDirecteurSerializer',
    'ModifierStatutSerializer',
    # Materiel
    'MaterielSerializer',
    'MaterielCreateSerializer',
    'MaterielUpdateSerializer',
    'MaterielMedicalSerializer',
    'MaterielMedicalCreateSerializer',
    'MaterielMedicalUpdateSerializer',
    'MaterielDurableSerializer',
    'MaterielDurableCreateSerializer',
    'MaterielDurableUpdateSerializer',
    # Livraison et Sortie
    'LivraisonSerializer',
    'LivraisonCreateSerializer',
    'LivraisonUpdateSerializer',
    'SortieSerializer',
    'SortieCreateSerializer',
    'SortieUpdateSerializer',
]

