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

    def perform_create(self, serializer):
        """Assigner le caissier actuel lors de la création."""
        serializer.save(caissier=self.request.user)

    
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
        
        # Statistiques de validation
        stats_validation = {
            'a_valider': self.queryset.filter(validee=False).count(),
            'validees': self.queryset.filter(validee=True).count(),
            'montant_a_valider': float(self.queryset.filter(validee=False).aggregate(
                total=Sum('Montant_paye'))['total'] or 0),
            'montant_validee': float(self.queryset.filter(validee=True).aggregate(
                total=Sum('Montant_paye'))['total'] or 0),
        }
        
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
            },
            'validation': stats_validation
        })
    
    @action(detail=False, methods=['get'])
    def a_valider(self, request):
        """
        Récupérer les quittances non validées (en attente de validation par le comptable).
        
        Endpoint: GET /api/quittances/a_valider/
        """
        quittances = self.queryset.filter(validee=False).order_by('-date_paiement')
        
        total = quittances.aggregate(total=Sum('Montant_paye'))['total'] or 0
        
        serializer = QuittanceSerializer(quittances, many=True)
        return Response({
            'count': quittances.count(),
            'total': float(total),
            'quittances': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def validees(self, request):
        """
        Récupérer les quittances validées.
        
        Endpoint: GET /api/quittances/validees/
        """
        quittances = self.queryset.filter(validee=True).order_by('-date_paiement')
        
        total = quittances.aggregate(total=Sum('Montant_paye'))['total'] or 0
        
        serializer = QuittanceSerializer(quittances, many=True)
        return Response({
            'count': quittances.count(),
            'total': float(total),
            'quittances': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        """
        Valider une quittance et créer automatiquement l'écriture comptable.
        
        Endpoint: POST /api/quittances/{id}/valider/
        
        Body:
        {
            "compte_comptable_id": 1  (requis - compte produit pour le crédit)
        }
        
        L'écriture créée sera:
        - Débit: Compte Caisse (571) ou selon mode de paiement
        - Crédit: Compte produit fourni (706xxx)
        """
        from apps.comptabilite_financiere.models import (
            Journal, EcritureComptable, LigneEcriture, CompteComptable
        )
        
        quittance = self.get_object()
        
        if quittance.validee:
            return Response({
                'success': False,
                'error': 'Cette quittance est déjà validée.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Le compte produit est requis
        compte_comptable_id = request.data.get('compte_comptable_id')
        if not compte_comptable_id:
            return Response({
                'success': False,
                'error': 'Le compte comptable (compte_comptable_id) est requis pour la ventilation.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier que le compte existe
        try:
            compte_produit = CompteComptable.objects.get(id=compte_comptable_id, actif=True)
        except CompteComptable.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Compte comptable {compte_comptable_id} non trouvé ou inactif.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Déterminer le journal et compte de trésorerie selon le mode de paiement
        mode_paiement = quittance.mode_paiement or 'especes'
        
        if mode_paiement in ['especes']:
            journal_code = 'JC'  # Journal de Caisse
            compte_tresorerie_num = '571'  # Caisse
        elif mode_paiement in ['mobile_money']:
            journal_code = 'JMM'  # Journal Mobile Money
            compte_tresorerie_num = '521'  # Banque
        else:  # carte, virement, cheque
            journal_code = 'JB'  # Journal de Banque
            compte_tresorerie_num = '521'  # Banque
        
        # Récupérer ou créer le compte de trésorerie
        compte_tresorerie, _ = CompteComptable.objects.get_or_create(
            numero_compte=compte_tresorerie_num,
            defaults={
                'libelle': 'Caisse' if compte_tresorerie_num == '571' else 'Banque',
                'classe': '5',
                'type_compte': 'tresorerie',
                'actif': True,
            }
        )
        
        # Récupérer le journal
        try:
            journal = Journal.objects.get(code=journal_code)
        except Journal.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Journal {journal_code} non configuré.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Générer le libellé de l'écriture
        patient_name = "Patient inconnu"
        if quittance.id_session and quittance.id_session.id_patient:
            p = quittance.id_session.id_patient
            patient_name = f"{p.nom} {p.prenom}".strip()
        
        libelle_ecriture = f"{quittance.Motif} - {patient_name}"
        
        # Créer l'écriture comptable
        numero_ecriture = EcritureComptable.generer_numero_ecriture()
        
        ecriture = EcritureComptable.objects.create(
            numero_ecriture=numero_ecriture,
            date_ecriture=quittance.date_paiement.date(),
            journal=journal,
            libelle=libelle_ecriture,
            quittance=quittance,
            piece_justificative=quittance.numero_quittance,
            comptable=request.user,
            statut='validee',
        )
        
        # Créer les lignes (partie double)
        montant = quittance.Montant_paye
        
        # Ligne 1: Débit au compte de trésorerie
        LigneEcriture.objects.create(
            ecriture=ecriture,
            compte=compte_tresorerie,
            libelle=f"Encaissement {quittance.Motif}",
            montant_debit=montant,
            montant_credit=0,
            ordre=0,
        )
        
        # Ligne 2: Crédit au compte de produit
        LigneEcriture.objects.create(
            ecriture=ecriture,
            compte=compte_produit,
            libelle=f"{quittance.Motif} - {patient_name}",
            montant_debit=0,
            montant_credit=montant,
            ordre=1,
        )
        
        # Mettre à jour la quittance
        quittance.validee = True
        quittance.id_comptable_affectation = request.user
        quittance.date_affectation_compte = timezone.now()
        quittance.compte_comptable_id = compte_comptable_id
        quittance.save()
        
        serializer = QuittanceSerializer(quittance)
        return Response({
            'success': True,
            'message': 'Quittance validée et écriture comptable générée.',
            'quittance': serializer.data,
            'ecriture': {
                'numero': ecriture.numero_ecriture,
                'journal': journal.code,
                'montant': float(montant),
                'compte_debit': compte_tresorerie.numero_compte,
                'compte_credit': compte_produit.numero_compte,
            }
        })
    
    @action(detail=False, methods=['get'])
    def journal_ventilation(self, request):
        """
        Journal de ventilation des recettes - quittances validées avec leur compte comptable.
        
        Endpoint: GET /api/quittances/journal_ventilation/
        
        Query params:
        - date_debut: Date de début (YYYY-MM-DD)
        - date_fin: Date de fin (YYYY-MM-DD)
        - compte_comptable_id: Filtrer par compte
        """
        quittances = self.queryset.filter(validee=True)
        
        # Filtrer par dates si fournies
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        if date_debut:
            quittances = quittances.filter(date_paiement__date__gte=date_debut)
        if date_fin:
            quittances = quittances.filter(date_paiement__date__lte=date_fin)
        
        # Filtrer par compte comptable
        compte_id = request.query_params.get('compte_comptable_id')
        if compte_id:
            quittances = quittances.filter(compte_comptable_id=compte_id)
        
        quittances = quittances.order_by('-date_affectation_compte')
        
        # Calculer les totaux
        total = quittances.aggregate(total=Sum('Montant_paye'))['total'] or 0
        
        # Grouper par compte comptable
        from django.db.models import Count as DjCount
        par_compte = quittances.values('compte_comptable_id').annotate(
            count=DjCount('idQuittance'),
            total=Sum('Montant_paye')
        )
        
        serializer = QuittanceSerializer(quittances, many=True)
        return Response({
            'count': quittances.count(),
            'total': float(total),
            'par_compte': list(par_compte),
            'quittances': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def export_pdf(self, request, pk=None):
        """
        Exporter une quittance validée en format JSON pour génération PDF côté frontend.
        
        Endpoint: GET /api/quittances/{id}/export_pdf/
        
        Returns all data needed to generate a PDF receipt.
        """
        quittance = self.get_object()
        
        # Récupérer les infos du patient
        patient_info = None
        if quittance.id_session and quittance.id_session.id_patient:
            patient = quittance.id_session.id_patient
            patient_info = {
                'matricule': patient.matricule,
                'nom': patient.nom,
                'prenom': patient.prenom,
                'full_name': f"{patient.nom} {patient.prenom}".strip(),
                'date_naissance': str(patient.date_naissance) if hasattr(patient, 'date_naissance') else None,
            }
        
        # Récupérer les infos du caissier
        caissier_info = None
        if quittance.caissier:
            caissier_info = {
                'nom': f"{quittance.caissier.nom} {quittance.caissier.prenom}".strip() or quittance.caissier.username,
            }
        
        # Récupérer les infos du comptable
        comptable_info = None
        if quittance.id_comptable_affectation:
            comptable_info = {
                'nom': f"{quittance.id_comptable_affectation.nom} {quittance.id_comptable_affectation.prenom}".strip() or quittance.id_comptable_affectation.username,
            }
        
        # Récupérer les infos du compte comptable
        compte_info = None
        if quittance.compte_comptable_id:
            from apps.comptabilite_financiere.models import CompteComptable
            try:
                compte = CompteComptable.objects.get(id=quittance.compte_comptable_id)
                compte_info = {
                    'numero': compte.numero_compte,
                    'libelle': compte.libelle,
                }
            except CompteComptable.DoesNotExist:
                pass
        
        return Response({
            'success': True,
            'quittance': {
                'numero': quittance.numero_quittance,
                'date_paiement': quittance.date_paiement.isoformat(),
                'montant': float(quittance.Montant_paye),
                'montant_lettres': self._montant_en_lettres(float(quittance.Montant_paye)),
                'motif': quittance.Motif,
                'type_recette': quittance.type_recette,
                'mode_paiement': quittance.mode_paiement,
                'validee': quittance.validee,
                'date_validation': quittance.date_affectation_compte.isoformat() if quittance.date_affectation_compte else None,
            },
            'patient': patient_info,
            'caissier': caissier_info,
            'comptable': comptable_info,
            'compte_comptable': compte_info,
            'hopital': {
                'nom': 'Polyclinique Fultang',
                'adresse': 'Yaoundé, Cameroun',
                'telephone': '+237 XXX XXX XXX',
            }
        })
    
    def _montant_en_lettres(self, montant):
        """Convertir un montant en lettres (simplifié)."""
        # Version simplifiée - vous pouvez utiliser une bibliothèque comme num2words
        unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf']
        dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
        
        if montant == 0:
            return "zéro franc CFA"
        
        montant_int = int(montant)
        
        if montant_int >= 1000000:
            millions = montant_int // 1000000
            reste = montant_int % 1000000
            return f"{millions} million(s) {self._montant_en_lettres(reste) if reste else ''} francs CFA".strip()
        elif montant_int >= 1000:
            milliers = montant_int // 1000
            reste = montant_int % 1000
            return f"{milliers} mille {reste if reste else ''} francs CFA".strip()
        else:
            return f"{montant_int} francs CFA"
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Exporter les quittances validées en CSV.
        
        Endpoint: GET /api/quittances/export_csv/
        
        Query params:
        - date_debut: Date de début (YYYY-MM-DD)
        - date_fin: Date de fin (YYYY-MM-DD)
        """
        import csv
        from django.http import HttpResponse
        
        quittances = self.queryset.filter(validee=True)
        
        # Filtrer par dates si fournies
        date_debut = request.query_params.get('date_debut')
        date_fin = request.query_params.get('date_fin')
        
        if date_debut:
            quittances = quittances.filter(date_paiement__date__gte=date_debut)
        if date_fin:
            quittances = quittances.filter(date_paiement__date__lte=date_fin)
        
        quittances = quittances.order_by('-date_paiement')
        
        # Créer la réponse CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="quittances_validees_{timezone.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Numéro Quittance',
            'Date Paiement',
            'Patient',
            'Motif',
            'Type Recette',
            'Mode Paiement',
            'Montant (FCFA)',
            'Compte Comptable',
            'Date Validation',
            'Validé par'
        ])
        
        for q in quittances:
            # Patient name
            patient_name = "N/A"
            if q.id_session and q.id_session.id_patient:
                patient_name = f"{q.id_session.id_patient.nom} {q.id_session.id_patient.prenom}"
            
            # Comptable name
            comptable_name = "N/A"
            if q.id_comptable_affectation:
                comptable_name = f"{q.id_comptable_affectation.nom} {q.id_comptable_affectation.prenom}".strip() or q.id_comptable_affectation.username
            
            # Compte comptable
            compte = "N/A"
            if q.compte_comptable_id:
                from apps.comptabilite_financiere.models import CompteComptable
                try:
                    c = CompteComptable.objects.get(id=q.compte_comptable_id)
                    compte = f"{c.numero_compte} - {c.libelle}"
                except CompteComptable.DoesNotExist:
                    pass
            
            writer.writerow([
                q.numero_quittance,
                q.date_paiement.strftime("%Y-%m-%d %H:%M"),
                patient_name,
                q.Motif,
                q.type_recette,
                q.mode_paiement,
                float(q.Montant_paye),
                compte,
                q.date_affectation_compte.strftime("%Y-%m-%d %H:%M") if q.date_affectation_compte else "N/A",
                comptable_name
            ])
        
        return response
    
    @action(detail=False, methods=['get'])
    def statistiques_avancees(self, request):
        """
        Statistiques avancées pour les rapports financiers.
        
        Endpoint: GET /api/quittances/statistiques_avancees/
        
        Query params:
        - periode: 'jour', 'semaine', 'mois', 'annee' (default: 'mois')
        
        Returns:
        - Current period stats
        - Previous period stats (same period last year)
        - Breakdown by type (type_recette)
        - Breakdown by payment mode (mode_paiement)
        - Monthly evolution for current and previous year
        """
        from django.db.models.functions import TruncMonth, Lower
        from datetime import date
        from dateutil.relativedelta import relativedelta
        
        periode = request.query_params.get('periode', 'mois')
        today = timezone.now()
        
        # Define current period boundaries
        if periode == 'jour':
            current_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
            current_end = today
            # Same day last year
            previous_start = current_start - relativedelta(years=1)
            previous_end = current_end - relativedelta(years=1)
        elif periode == 'semaine':
            current_start = today - timedelta(days=today.weekday())  # Monday
            current_start = current_start.replace(hour=0, minute=0, second=0, microsecond=0)
            current_end = today
            previous_start = current_start - relativedelta(years=1)
            previous_end = current_end - relativedelta(years=1)
        elif periode == 'annee':
            current_start = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            current_end = today
            previous_start = current_start - relativedelta(years=1)
            previous_end = current_end - relativedelta(years=1)
        else:  # mois (default)
            current_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            current_end = today
            previous_start = current_start - relativedelta(years=1)
            previous_end = current_end - relativedelta(years=1)
        
        # Current period stats
        current_qs = self.queryset.filter(
            validee=True,
            date_paiement__gte=current_start,
            date_paiement__lte=current_end
        )
        current_stats = current_qs.aggregate(
            count=Count('idQuittance'),
            total=Sum('Montant_paye')
        )
        
        # Previous period stats (same period last year)
        previous_qs = self.queryset.filter(
            validee=True,
            date_paiement__gte=previous_start,
            date_paiement__lte=previous_end
        )
        previous_stats = previous_qs.aggregate(
            count=Count('idQuittance'),
            total=Sum('Montant_paye')
        )
        
        # Calculate variation percentage
        current_total = float(current_stats['total'] or 0)
        previous_total = float(previous_stats['total'] or 0)
        if previous_total > 0:
            variation = round(((current_total - previous_total) / previous_total) * 100, 1)
        else:
            variation = 100 if current_total > 0 else 0
        
        # Breakdown by type (normalize case-insensitive)
        par_type_raw = self.queryset.filter(validee=True).values('type_recette').annotate(
            count=Count('idQuittance'),
            total=Sum('Montant_paye')
        )
        par_type = {}
        for item in par_type_raw:
            type_key = (item['type_recette'] or 'autre').lower()
            if type_key not in par_type:
                par_type[type_key] = {'count': 0, 'total': 0}
            par_type[type_key]['count'] += item['count']
            par_type[type_key]['total'] += float(item['total'] or 0)
        
        # Breakdown by payment mode (normalize case-insensitive)
        par_mode_raw = self.queryset.filter(validee=True).values('mode_paiement').annotate(
            count=Count('idQuittance'),
            total=Sum('Montant_paye')
        )
        par_mode = {}
        for item in par_mode_raw:
            mode_key = (item['mode_paiement'] or 'autre').lower()
            if mode_key not in par_mode:
                par_mode[mode_key] = {'count': 0, 'total': 0}
            par_mode[mode_key]['count'] += item['count']
            par_mode[mode_key]['total'] += float(item['total'] or 0)
        
        # Monthly evolution for current year
        current_year = today.year
        year_start = today.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        evolution_current = self.queryset.filter(
            validee=True,
            date_paiement__year=current_year
        ).annotate(
            month=TruncMonth('date_paiement')
        ).values('month').annotate(
            count=Count('idQuittance'),
            total=Sum('Montant_paye')
        ).order_by('month')
        
        # Monthly evolution for previous year
        evolution_previous = self.queryset.filter(
            validee=True,
            date_paiement__year=current_year - 1
        ).annotate(
            month=TruncMonth('date_paiement')
        ).values('month').annotate(
            count=Count('idQuittance'),
            total=Sum('Montant_paye')
        ).order_by('month')
        
        # Convert to dict by month number
        months_current = {e['month'].month: float(e['total'] or 0) for e in evolution_current}
        months_previous = {e['month'].month: float(e['total'] or 0) for e in evolution_previous}
        
        # Build evolution array (12 months)
        month_names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
        evolution = []
        for i in range(1, 13):
            evolution.append({
                'mois': i,
                'nom': month_names[i-1],
                'actuel': months_current.get(i, 0),
                'precedent': months_previous.get(i, 0)
            })
        
        # Build 5-year comparison
        yearly_comparison = []
        for year in range(current_year - 4, current_year + 1):
            year_stats = self.queryset.filter(
                validee=True,
                date_paiement__year=year
            ).aggregate(
                count=Count('idQuittance'),
                total=Sum('Montant_paye')
            )
            yearly_comparison.append({
                'annee': year,
                'count': year_stats['count'] or 0,
                'total': float(year_stats['total'] or 0)
            })
        
        return Response({
            'periode': {
                'type': periode,
                'actuel': {
                    'debut': current_start.date().isoformat(),
                    'fin': current_end.date().isoformat(),
                    'count': current_stats['count'] or 0,
                    'total': current_total
                },
                'precedent': {
                    'debut': previous_start.date().isoformat(),
                    'fin': previous_end.date().isoformat(),
                    'count': previous_stats['count'] or 0,
                    'total': previous_total
                },
                'variation': variation
            },
            'par_type': par_type,
            'par_mode': par_mode,
            'evolution_mensuelle': evolution,
            'comparaison_annuelle': yearly_comparison
        })

