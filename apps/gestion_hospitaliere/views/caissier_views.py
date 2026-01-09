"""
Views pour les endpoints du caissier.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-21
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.suivi_patient.models import Session, Patient
from apps.gestion_hospitaliere.serializers import PatientSerializer


class CaissierViewSet(viewsets.ViewSet):
    """
    ViewSet pour les endpoints du caissier.
    
    Endpoints:
    - GET /api/caissier/patients-en-attente/
    """
    
    permission_classes = []  # TEMPORAIRE: Desactive pour tests
    
    @extend_schema(
        summary="Liste de tous les patients en attente",
        description="Retourne tous les patients ayant une session en attente (situation_patient='en attente')",
        responses={200: PatientSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='patients-en-attente')
    def patients_en_attente(self, request):
        """
        Retourne tous les patients avec sessions en attente.
        
        Pour le caissier : tous les patients en attente de paiement/traitement.
        """
        try:
            # Récupérer toutes les sessions en attente
            sessions_en_attente = Session.objects.filter(
                situation_patient='en attente',
                statut='en cours'
            ).select_related('id_patient').order_by('-debut')
            
            # Extraire les patients uniques
            patients_dict = {}
            for session in sessions_en_attente:
                patient = session.id_patient
                if patient.id not in patients_dict:
                    # Calculer l'âge
                    from datetime import date
                    today = date.today()
                    age = today.year - patient.date_naissance.year
                    if today.month < patient.date_naissance.month or \
                       (today.month == patient.date_naissance.month and today.day < patient.date_naissance.day):
                        age -= 1
                    
                    patients_dict[patient.id] = {
                        'id': patient.id,
                        'matricule': patient.matricule,
                        'nom': patient.nom,
                        'prenom': patient.prenom,
                        'date_naissance': patient.date_naissance,
                        'age': age,
                        'contact': patient.contact,
                        'adresse': patient.adresse,
                        'id_session': session.id,
                        'service_courant': session.service_courant,
                        'personnel_responsable': session.personnel_responsable,
                        'debut': session.debut
                    }
            
            # Convertir en liste
            patients_list = list(patients_dict.values())
            
            return Response({
                'success': True,
                'count': len(patients_list),
                'data': patients_list
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Erreur lors de la récupération des patients',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @extend_schema(
        summary="Get patient receipts",
        description="Returns all quittances for a specific patient by going through their sessions",
        responses={200: dict}
    )
    @action(detail=True, methods=['get'], url_path='quittances')
    def get_patient_quittances(self, request, pk=None):
        """
        Get all quittances for a patient through their sessions.
        """
        try:
            from apps.comptabilite_financiere.models import Quittance
            
            # Get all sessions for this patient
            sessions = Session.objects.filter(id_patient_id=pk)
            
            # Get all quittances for these sessions
            quittances = Quittance.objects.filter(
                id_session__in=sessions
            ).select_related('id_session').order_by('-date_paiement')
            
            quittances_data = []
            for q in quittances:
                quittances_data.append({
                    'idQuittance': q.idQuittance,
                    'numero_quittance': q.numero_quittance,
                    'date_paiement': q.date_paiement,
                    'Montant_paye': str(q.Montant_paye),
                    'Motif': q.Motif,
                    'id_session': q.id_session.id if q.id_session else None,
                    'service': q.id_session.service_courant if q.id_session else None
                })
            
            return Response({
                'success': True,
                'count': len(quittances_data),
                'data': quittances_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error fetching patient receipts',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @extend_schema(
        summary="Redirect patient to another service",
        description="Updates the service_courant field of the patient's active session",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'new_service': {'type': 'string', 'description': 'New service name'}
                },
                'required': ['new_service']
            }
        },
        responses={200: dict}
    )
    @action(detail=True, methods=['post'], url_path='redirect-service')
    def redirect_patient(self, request, pk=None):
        """
        Redirect patient to another service by updating their session's service_courant.
        """
        try:
            new_service = request.data.get('new_service')
            
            if not new_service:
                return Response({
                    'success': False,
                    'error': 'New service is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get the patient's active session
            session = Session.objects.filter(
                id_patient_id=pk,
                statut='en cours'
            ).order_by('-debut').first()
            
            if not session:
                return Response({
                    'success': False,
                    'error': 'No active session found for this patient'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Update service_courant
            session.service_courant = new_service
            session.save()
            
            return Response({
                'success': True,
                'message': f'Patient redirected to {new_service}',
                'data': {
                    'session_id': session.id,
                    'old_service': session.service_courant,
                    'new_service': new_service
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Error redirecting patient',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
