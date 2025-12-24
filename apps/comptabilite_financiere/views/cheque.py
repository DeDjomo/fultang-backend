"""
Vues pour le modèle Cheque.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-23
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.comptabilite_financiere.models import Cheque
from apps.comptabilite_financiere.serializers import (
    ChequeSerializer,
    ChequeCreateSerializer,
    ChequeEncaissementSerializer,
)


class ChequeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les chèques.
    
    list: Liste tous les chèques
    retrieve: Récupère un chèque par son numéro
    create: Crée un nouveau chèque (montant + patient requis)
    update: Met à jour un chèque
    destroy: Supprime un chèque
    encaisser: Enregistre la date d'encaissement d'un chèque
    """
    
    queryset = Cheque.objects.all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['patient', 'date_encaissement']
    search_fields = ['patient__nom', 'patient__prenom', 'patient__matricule']
    ordering_fields = ['date_emission', 'montant', 'date_encaissement']
    ordering = ['-date_emission']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChequeCreateSerializer
        if self.action == 'encaisser':
            return ChequeEncaissementSerializer
        return ChequeSerializer
    
    def create(self, request, *args, **kwargs):
        """Crée un nouveau chèque avec montant et patient."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cheque = Cheque.objects.create(**serializer.validated_data)
        return Response(
            ChequeSerializer(cheque).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post', 'patch'], url_path='encaisser')
    def encaisser(self, request, pk=None):
        """
        Enregistre la date d'encaissement d'un chèque.
        Si aucune date n'est fournie, utilise la date actuelle.
        """
        cheque = self.get_object()
        
        if cheque.date_encaissement is not None:
            return Response(
                {'error': 'Ce chèque a déjà été encaissé.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ChequeEncaissementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cheque.date_encaissement = serializer.validated_data['date_encaissement']
        cheque.save()
        
        return Response(
            ChequeSerializer(cheque).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='non-encaisses')
    def non_encaisses(self, request):
        """Liste tous les chèques non encaissés."""
        cheques = Cheque.objects.filter(date_encaissement__isnull=True)
        serializer = ChequeSerializer(cheques, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='encaisses')
    def encaisses(self, request):
        """Liste tous les chèques encaissés."""
        cheques = Cheque.objects.filter(date_encaissement__isnull=False)
        serializer = ChequeSerializer(cheques, many=True)
        return Response(serializer.data)
