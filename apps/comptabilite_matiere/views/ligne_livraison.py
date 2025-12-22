from rest_framework import viewsets
from apps.comptabilite_matiere.models import LigneLivraison
from apps.comptabilite_matiere.serializers import LigneLivraisonSerializer

class LigneLivraisonViewSet(viewsets.ModelViewSet):
    """ViewSet for managing LigneLivraison objects."""
    queryset = LigneLivraison.objects.all()
    serializer_class = LigneLivraisonSerializer
