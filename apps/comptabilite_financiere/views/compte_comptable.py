"""
ViewSets pour le modèle CompteComptable.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.comptabilite_financiere.models import CompteComptable
from apps.comptabilite_financiere.serializers import (
    CompteComptableSerializer,
    CompteComptableCreateSerializer,
    CompteComptableListSerializer,
)


class CompteComptableViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer le Plan Comptable.
    
    Endpoints:
    - GET /api/comptes-comptables/ : Liste tous les comptes
    - POST /api/comptes-comptables/ : Créer un nouveau compte
    - GET /api/comptes-comptables/{id}/ : Détails d'un compte
    - PATCH /api/comptes-comptables/{id}/ : Mettre à jour un compte
    - DELETE /api/comptes-comptables/{id}/ : Supprimer un compte
    - GET /api/comptes-comptables/par_classe/{classe}/ : Comptes par classe
    - GET /api/comptes-comptables/produits/ : Comptes de produits (Classe 7)
    - GET /api/comptes-comptables/statistiques/ : Statistiques
    """
    
    queryset = CompteComptable.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    filterset_fields = ['classe', 'type_compte', 'actif']
    search_fields = ['numero_compte', 'libelle', 'description']
    ordering_fields = ['numero_compte', 'libelle', 'date_creation']
    ordering = ['numero_compte']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompteComptableCreateSerializer
        elif self.action == 'list' and self.request.query_params.get('simple') == 'true':
            return CompteComptableListSerializer
        return CompteComptableSerializer
    
    @action(detail=False, methods=['get'], url_path='par-classe/(?P<classe>[1-7])')
    def par_classe(self, request, classe=None):
        """
        Récupérer les comptes d'une classe spécifique.
        
        Endpoint: GET /api/comptes-comptables/par-classe/{classe}/
        """
        comptes = self.queryset.filter(classe=classe, actif=True)
        serializer = CompteComptableSerializer(comptes, many=True)
        return Response({
            'classe': classe,
            'count': comptes.count(),
            'comptes': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def produits(self, request):
        """
        Récupérer tous les comptes de produits (Classe 7).
        Utilisé pour la ventilation des recettes.
        
        Endpoint: GET /api/comptes-comptables/produits/
        """
        comptes = self.queryset.filter(classe='7', actif=True)
        serializer = CompteComptableListSerializer(comptes, many=True)
        return Response({
            'count': comptes.count(),
            'comptes': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """
        Statistiques sur les comptes comptables.
        
        Endpoint: GET /api/comptes-comptables/statistiques/
        """
        total = self.queryset.count()
        actifs = self.queryset.filter(actif=True).count()
        
        # Comptes par classe
        par_classe = {}
        for classe, label in CompteComptable.CLASSE_CHOICES:
            par_classe[classe] = {
                'label': label,
                'count': self.queryset.filter(classe=classe).count()
            }
        
        # Comptes par type
        par_type = {}
        for type_compte, label in CompteComptable.TYPE_COMPTE_CHOICES:
            par_type[type_compte] = {
                'label': label,
                'count': self.queryset.filter(type_compte=type_compte).count()
            }
        
        return Response({
            'total': total,
            'actifs': actifs,
            'inactifs': total - actifs,
            'par_classe': par_classe,
            'par_type': par_type
        })
    
    @action(detail=False, methods=['get'])
    def arborescence(self, request):
        """
        Récupérer les comptes en format arborescence.
        
        Endpoint: GET /api/comptes-comptables/arborescence/
        """
        # Récupérer les comptes racines (sans parent)
        comptes_racines = self.queryset.filter(compte_parent__isnull=True, actif=True)
        
        def get_children(compte):
            children = compte.sous_comptes.filter(actif=True)
            return {
                'id': compte.id,
                'numero_compte': compte.numero_compte,
                'libelle': compte.libelle,
                'classe': compte.classe,
                'type_compte': compte.type_compte,
                'enfants': [get_children(c) for c in children]
            }
        
        arborescence = [get_children(c) for c in comptes_racines]
        
        return Response({
            'count': self.queryset.filter(actif=True).count(),
            'arborescence': arborescence
        })
