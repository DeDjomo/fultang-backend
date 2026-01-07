"""
ViewSets pour le modèle Quittance.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count

from apps.comptabilite_financiere.models import Quittance
from apps.comptabilite_financiere.serializers import (
    QuittanceSerializer,
    QuittanceCreateSerializer,
    QuittanceUpdateSerializer,
)


class QuittanceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les quittances.
    
    Endpoints:
    - GET /api/quittances/ : Liste toutes les quittances
    - POST /api/quittances/ : Créer une nouvelle quittance
    - GET /api/quittances/{id}/ : Détails d'une quittance
    - PATCH /api/quittances/{id}/ : Mettre à jour une quittance
    - DELETE /api/quittances/{id}/ : Supprimer une quittance
    - GET /api/quittances/du_jour/ : Quittances du jour
    - GET /api/quittances/de_la_semaine/ : Quittances de la semaine
    - GET /api/quittances/du_mois/ : Quittances du mois
    - GET /api/quittances/statistiques/ : Statistiques globales
    """
    
    queryset = Quittance.objects.all()
    permission_classes = []  # TEMPORAIRE: Desactive pour tests
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    search_fields = ['numero_quittance', 'Motif']
    ordering_fields = ['date_paiement', 'Montant_paye']
    ordering = ['-date_paiement']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuittanceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return QuittanceUpdateSerializer
        return QuittanceSerializer
    
    @action(detail=False, methods=['get'])
    def du_jour(self, request):
        """
        Récupérer les quittances du jour actuel.
        
        Endpoint: GET /api/quittances/du_jour/
        
        Retourne toutes les quittances émises aujourd'hui avec le total.
        """
        today = timezone.now().date()
        quittances = self.queryset.filter(
            date_paiement__date=today
        )
        
        # Calcul du total
        total = quittances.aggregate(total=Sum('Montant_paye'))['total'] or 0
        
        serializer = QuittanceSerializer(quittances, many=True)
        return Response({
            'date': today,
            'count': quittances.count(),
            'total': float(total),
            'quittances': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def de_la_semaine(self, request):
        """
        Récupérer les quittances de la semaine actuelle (7 derniers jours).
        
        Endpoint: GET /api/quittances/de_la_semaine/
        
        Retourne toutes les quittances émises cette semaine avec le total.
        """
        today = timezone.now()
        week_start = today - timedelta(days=7)
        
        quittances = self.queryset.filter(
            date_paiement__gte=week_start,
            date_paiement__lte=today
        )
        
        # Calcul du total
        total = quittances.aggregate(total=Sum('Montant_paye'))['total'] or 0
        
        serializer = QuittanceSerializer(quittances, many=True)
        return Response({
            'periode': {
                'debut': week_start.date(),
                'fin': today.date()
            },
            'count': quittances.count(),
            'total': float(total),
            'quittances': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def du_mois(self, request):
        """
        Récupérer les quittances du mois actuel.
        
        Endpoint: GET /api/quittances/du_mois/
        
        Retourne toutes les quittances émises ce mois avec le total.
        """
        today = timezone.now()
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        quittances = self.queryset.filter(
            date_paiement__gte=month_start,
            date_paiement__lte=today
        )
        
        # Calcul du total
        total = quittances.aggregate(total=Sum('Montant_paye'))['total'] or 0
        
        serializer = QuittanceSerializer(quittances, many=True)
        return Response({
            'mois': today.strftime('%B %Y'),
            'periode': {
                'debut': month_start.date(),
                'fin': today.date()
            },
            'count': quittances.count(),
            'total': float(total),
            'quittances': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """
        Statistiques globales sur les quittances.
        
        Endpoint: GET /api/quittances/statistiques/
        """
        today = timezone.now()
        
        # Statistiques globales
        stats_globales = self.queryset.aggregate(
            total_quittances=Count('idQuittance'),
            montant_total=Sum('Montant_paye'),
        )
        
        # Statistiques du jour
        stats_jour = self.queryset.filter(date_paiement__date=today.date()).aggregate(
            count_jour=Count('idQuittance'),
            total_jour=Sum('Montant_paye'),
        )
        
        # Statistiques du mois
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        stats_mois = self.queryset.filter(
            date_paiement__gte=month_start,
            date_paiement__lte=today
        ).aggregate(
            count_mois=Count('idQuittance'),
            total_mois=Sum('Montant_paye'),
        )
        
        return Response({
            'global': {
                'total_quittances': stats_globales['total_quittances'] or 0,
                'montant_total': float(stats_globales['montant_total']) if stats_globales['montant_total'] else 0,
            },
            'aujourdhui': {
                'count': stats_jour['count_jour'] or 0,
                'total': float(stats_jour['total_jour']) if stats_jour['total_jour'] else 0,
            },
            'ce_mois': {
                'count': stats_mois['count_mois'] or 0,
                'total': float(stats_mois['total_mois']) if stats_mois['total_mois'] else 0,
            }
        })
