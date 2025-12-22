"""
URLs de l'application comptabilite_matiere.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.comptabilite_matiere.views import (
    BesoinViewSet,
    MaterielViewSet,
    MaterielMedicalViewSet,
    MaterielDurableViewSet,
    LivraisonViewSet,
    SortieViewSet,
    RapportViewSet,
    LigneLivraisonViewSet,
)

app_name = 'comptabilite_matiere'

router = DefaultRouter()

# Enregistrer les ViewSets
router.register(r'besoins', BesoinViewSet, basename='besoin')
router.register(r'materiels', MaterielViewSet, basename='materiel')
router.register(r'materiels-medicaux', MaterielMedicalViewSet, basename='materiel-medical')
router.register(r'materiels-durables', MaterielDurableViewSet, basename='materiel-durable')
router.register(r'livraisons', LivraisonViewSet, basename='livraison')
router.register(r'sorties', SortieViewSet, basename='sortie')
router.register(r'rapports', RapportViewSet, basename='rapport')
router.register(r'lignes-livraison', LigneLivraisonViewSet, basename='lignelivraison')

urlpatterns = [
    path('', include(router.urls)),
]

