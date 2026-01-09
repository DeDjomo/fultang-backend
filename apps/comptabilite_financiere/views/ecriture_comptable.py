"""
ViewSets pour les écritures comptables.

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
from django.db.models import Sum, Q
from decimal import Decimal

from apps.comptabilite_financiere.models import (
    Journal,
    EcritureComptable,
    LigneEcriture,
    CompteComptable,
)
from apps.comptabilite_financiere.serializers import (
    JournalSerializer,
    EcritureComptableSerializer,
    EcritureComptableCreateSerializer,
    LigneEcritureSerializer,
)


class JournalViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les journaux comptables.
    
    Endpoints:
    - GET /api/journaux/ : Liste tous les journaux
    - GET /api/journaux/{code}/ : Détails d'un journal
    """
    
    queryset = Journal.objects.all()
    serializer_class = JournalSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'code'
    
    @action(detail=True, methods=['get'])
    def ecritures(self, request, code=None):
        """
        Récupérer toutes les écritures d'un journal.
        
        Endpoint: GET /api/journaux/{code}/ecritures/
        
        Query params:
        - date_debut: Date de début (YYYY-MM-DD)
        - date_fin: Date de fin (YYYY-MM-DD)
        """
        journal = self.get_object()
        ecritures = journal.ecritures.all()
        
        # Filtrage par dates
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        if date_debut:
            ecritures = ecritures.filter(date_ecriture__gte=date_debut)
        if date_fin:
            ecritures = ecritures.filter(date_ecriture__lte=date_fin)
        
        ecritures = ecritures.order_by('-date_ecriture', '-numero_ecriture')
        
        # Calculer les totaux
        totaux = {'debit': Decimal('0'), 'credit': Decimal('0')}
        for e in ecritures:
            totaux['debit'] += e.total_debit
            totaux['credit'] += e.total_credit
        
        serializer = EcritureComptableSerializer(ecritures, many=True)
        return Response({
            'journal': journal.code,
            'libelle': journal.libelle,
            'count': ecritures.count(),
            'total_debit': float(totaux['debit']),
            'total_credit': float(totaux['credit']),
            'ecritures': serializer.data
        })


class EcritureComptableViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les écritures comptables.
    
    Endpoints:
    - GET /api/ecritures/ : Liste les écritures
    - POST /api/ecritures/ : Créer une écriture
    - GET /api/ecritures/{id}/ : Détail d'une écriture
    - GET /api/ecritures/grand-livre/{compte_id}/ : Grand Livre d'un compte
    - GET /api/ecritures/balance/ : Balance des comptes
    """
    
    queryset = EcritureComptable.objects.prefetch_related('lignes').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    search_fields = ['numero_ecriture', 'libelle']
    ordering_fields = ['date_ecriture', 'numero_ecriture']
    ordering = ['-date_ecriture', '-numero_ecriture']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EcritureComptableCreateSerializer
        return EcritureComptableSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'], url_path='grand-livre/(?P<compte_id>[0-9]+)')
    def grand_livre(self, request, compte_id=None):
        """
        Récupérer le Grand Livre d'un compte (tous ses mouvements).
        
        Endpoint: GET /api/ecritures/grand-livre/{compte_id}/
        
        Query params:
        - date_debut: Date de début (YYYY-MM-DD)
        - date_fin: Date de fin (YYYY-MM-DD)
        """
        try:
            compte = CompteComptable.objects.get(id=compte_id)
        except CompteComptable.DoesNotExist:
            return Response(
                {'error': f'Compte {compte_id} non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Récupérer toutes les lignes de ce compte
        lignes = LigneEcriture.objects.filter(
            compte=compte,
            ecriture__statut='validee'
        ).select_related('ecriture', 'ecriture__journal')
        
        # Filtrage par dates
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        if date_debut:
            lignes = lignes.filter(ecriture__date_ecriture__gte=date_debut)
        if date_fin:
            lignes = lignes.filter(ecriture__date_ecriture__lte=date_fin)
        
        lignes = lignes.order_by('ecriture__date_ecriture', 'ecriture__numero_ecriture')
        
        # Construire le grand livre avec solde cumulé
        mouvements = []
        solde_cumule = Decimal('0')
        total_debit = Decimal('0')
        total_credit = Decimal('0')
        
        for ligne in lignes:
            debit = ligne.montant_debit or Decimal('0')
            credit = ligne.montant_credit or Decimal('0')
            
            # Pour les comptes d'actif/charge: Débit augmente, Crédit diminue
            # Pour les comptes de passif/produit: Crédit augmente, Débit diminue
            if compte.type_compte in ['actif', 'charge']:
                solde_cumule += debit - credit
            else:
                solde_cumule += credit - debit
            
            total_debit += debit
            total_credit += credit
            
            mouvements.append({
                'date_ecriture': ligne.ecriture.date_ecriture,
                'numero_ecriture': ligne.ecriture.numero_ecriture,
                'journal': ligne.ecriture.journal.code,
                'libelle': ligne.libelle or ligne.ecriture.libelle,
                'piece': ligne.ecriture.piece_justificative,
                'debit': float(debit),
                'credit': float(credit),
                'solde_cumule': float(solde_cumule),
            })
        
        return Response({
            'compte': {
                'id': compte.id,
                'numero': compte.numero_compte,
                'libelle': compte.libelle,
                'classe': compte.classe,
                'type_compte': compte.type_compte,
            },
            'periode': {
                'date_debut': date_debut,
                'date_fin': date_fin,
            },
            'totaux': {
                'total_debit': float(total_debit),
                'total_credit': float(total_credit),
                'solde_final': float(solde_cumule),
            },
            'mouvements_count': len(mouvements),
            'mouvements': mouvements,
        })
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """
        Récupérer la Balance des comptes.
        
        Endpoint: GET /api/ecritures/balance/
        
        Query params:
        - date_debut: Date de début (YYYY-MM-DD)
        - date_fin: Date de fin (YYYY-MM-DD)
        - classe: Filtrer par classe (1-7)
        """
        # Filtrage par dates
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        classe = request.query_params.get('classe')
        
        # Base queryset
        lignes_qs = LigneEcriture.objects.filter(
            ecriture__statut='validee'
        )
        
        if date_debut:
            lignes_qs = lignes_qs.filter(ecriture__date_ecriture__gte=date_debut)
        if date_fin:
            lignes_qs = lignes_qs.filter(ecriture__date_ecriture__lte=date_fin)
        
        # Récupérer les comptes avec mouvements
        comptes_avec_mouvements = lignes_qs.values('compte').distinct()
        
        # Filtrer les comptes
        comptes = CompteComptable.objects.filter(
            id__in=[c['compte'] for c in comptes_avec_mouvements],
            actif=True
        )
        
        if classe:
            comptes = comptes.filter(classe=classe)
        
        comptes = comptes.order_by('numero_compte')
        
        # Calculer les totaux pour chaque compte
        balance = []
        totaux_generaux = {
            'total_debit': Decimal('0'),
            'total_credit': Decimal('0'),
            'solde_debit': Decimal('0'),
            'solde_credit': Decimal('0'),
        }
        
        for compte in comptes:
            aggregation = lignes_qs.filter(compte=compte).aggregate(
                total_debit=Sum('montant_debit'),
                total_credit=Sum('montant_credit'),
            )
            
            total_debit = aggregation['total_debit'] or Decimal('0')
            total_credit = aggregation['total_credit'] or Decimal('0')
            
            # Calculer le solde (débiteur ou créditeur)
            difference = total_debit - total_credit
            solde_debit = difference if difference > 0 else Decimal('0')
            solde_credit = -difference if difference < 0 else Decimal('0')
            
            balance.append({
                'compte_id': compte.id,
                'numero_compte': compte.numero_compte,
                'libelle': compte.libelle,
                'classe': compte.classe,
                'total_debit': float(total_debit),
                'total_credit': float(total_credit),
                'solde_debit': float(solde_debit),
                'solde_credit': float(solde_credit),
            })
            
            totaux_generaux['total_debit'] += total_debit
            totaux_generaux['total_credit'] += total_credit
            totaux_generaux['solde_debit'] += solde_debit
            totaux_generaux['solde_credit'] += solde_credit
        
        return Response({
            'periode': {
                'date_debut': date_debut,
                'date_fin': date_fin,
            },
            'totaux': {
                'total_debit': float(totaux_generaux['total_debit']),
                'total_credit': float(totaux_generaux['total_credit']),
                'solde_debit': float(totaux_generaux['solde_debit']),
                'solde_credit': float(totaux_generaux['solde_credit']),
            },
            'comptes_count': len(balance),
            'balance': balance,
        })
    
    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """
        Statistiques sur les écritures comptables.
        
        Endpoint: GET /api/ecritures/statistiques/
        """
        from django.utils import timezone
        
        today = timezone.now().date()
        month_start = today.replace(day=1)
        
        # Stats globales
        total_ecritures = self.queryset.filter(statut='validee').count()
        
        # Stats du jour
        ecritures_jour = self.queryset.filter(
            date_ecriture=today,
            statut='validee'
        ).count()
        
        # Stats du mois
        ecritures_mois = self.queryset.filter(
            date_ecriture__gte=month_start,
            statut='validee'
        ).count()
        
        # Par journal
        par_journal = {}
        for journal in Journal.objects.filter(actif=True):
            count = self.queryset.filter(
                journal=journal,
                statut='validee'
            ).count()
            par_journal[journal.code] = {
                'libelle': journal.libelle,
                'count': count,
            }
        
        return Response({
            'total_ecritures': total_ecritures,
            'ecritures_jour': ecritures_jour,
            'ecritures_mois': ecritures_mois,
            'par_journal': par_journal,
        })
