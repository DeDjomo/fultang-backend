"""
Vues pour PrestationDeService.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-24
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404

from apps.comptabilite_financiere.models import PrestationDeService
from apps.comptabilite_financiere.serializers import (
    PrestationDeServiceSerializer,
    PrestationDeServiceCreateSerializer,
    PrestationDeServiceUpdateSerializer,
)


class PrestationDeServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les prestations de service.
    
    Endpoints:
    - GET /prestations-de-service/ - Liste toutes les prestations
    - POST /prestations-de-service/ - Créer une nouvelle prestation
    - GET /prestations-de-service/{id}/ - Détails d'une prestation
    - PUT /prestations-de-service/{id}/ - Mettre à jour une prestation
    - PATCH /prestations-de-service/{id}/ - Mise à jour partielle
    - DELETE /prestations-de-service/{id}/ - Supprimer une prestation
    - GET /prestations-de-service/by-code/{code_comptable}/ - Filtrer par code comptable
    - GET /prestations-de-service/by-service/{service_id}/ - Filtrer par service
    """
    
    queryset = PrestationDeService.objects.select_related('service_rendu').all()
    
    def get_serializer_class(self):
        """Retourne le sérialiseur approprié selon l'action."""
        if self.action == 'create':
            return PrestationDeServiceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PrestationDeServiceUpdateSerializer
        return PrestationDeServiceSerializer
    
    def list(self, request, *args, **kwargs):
        """Liste toutes les prestations de service."""
        queryset = self.get_queryset()
        
        # Filtrage optionnel par code_comptable
        code_comptable = request.query_params.get('code_comptable')
        if code_comptable:
            queryset = queryset.filter(code_comptable=code_comptable)
        
        # Filtrage optionnel par service_rendu
        service_id = request.query_params.get('service_rendu')
        if service_id:
            queryset = queryset.filter(service_rendu_id=service_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Crée une nouvelle prestation de service."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        # Retourner les détails complets
        response_serializer = PrestationDeServiceSerializer(instance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='by-code/(?P<code_comptable>[0-9]+)')
    def by_code(self, request, code_comptable=None):
        """Retourne les prestations filtrées par code comptable."""
        queryset = self.get_queryset().filter(code_comptable=code_comptable)
        serializer = PrestationDeServiceSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-service/(?P<service_id>[0-9]+)')
    def by_service(self, request, service_id=None):
        """Retourne les prestations filtrées par service."""
        queryset = self.get_queryset().filter(service_rendu_id=service_id)
        serializer = PrestationDeServiceSerializer(queryset, many=True)
        return Response(serializer.data)
