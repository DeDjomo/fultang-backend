"""
ViewSets pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-21
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter

from apps.suivi_patient.models import (
    ObservationMedicale,
    DossierPatient,
    PrescriptionMedicament,
    PrescriptionExamen,
    ResultatExamen,
    Hospitalisation
)
from apps.gestion_hospitaliere.serializers import (
    ObservationMedicaleSerializer,
    ObservationMedicaleCreateSerializer,
    DossierPatientSerializer,
    PrescriptionMedicamentSerializer,
    PrescriptionExamenSerializer,
    ResultatExamenSerializer,
    HospitalisationSerializer
)


class ObservationMedicaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les observations médicales.
    
    Liste et crée des observations médicales.
    """
    queryset = ObservationMedicale.objects.all()
    serializer_class = ObservationMedicaleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ObservationMedicaleCreateSerializer
        return ObservationMedicaleSerializer
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='id_session',
                description='Filtrer par ID de session',
                required=False,
                type=int
            )
        ]
    )
    def list(self, request):
        """
        Liste les observations médicales.
        
        Peut être filtré par id_session.
        """
        queryset = self.get_queryset()
        
        # Filtrer par session si fourni
        id_session = request.query_params.get('id_session')
        if id_session:
            queryset = queryset.filter(id_session=id_session)
        
        queryset = queryset.select_related('id_personnel', 'id_session').order_by('-date_heure')
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })
    
    def create(self, request):
        """
        Crée une nouvelle observation médicale.
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        observation = serializer.save()
        response_serializer = ObservationMedicaleSerializer(observation)
        
        return Response({
            'success': True,
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class DossierPatientViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les dossiers patients (lecture seule).
    """
    queryset = DossierPatient.objects.all()
    serializer_class = DossierPatientSerializer
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='id_patient',
                description='Filtrer par ID de patient',
                required=False,
                type=int
            )
        ]
    )
    def list(self, request):
        """
        Liste les dossiers patients.
        
        Peut être filtré par id_patient.
        """
        queryset = self.get_queryset()
        
        # Filtrer par patient si fourni
        id_patient = request.query_params.get('id_patient')
        if id_patient:
            queryset = queryset.filter(id_patient=id_patient)
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        })


class PrescriptionMedicamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les prescriptions de médicaments.
    """
    queryset = PrescriptionMedicament.objects.all()
    serializer_class = PrescriptionMedicamentSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """
        Crée une nouvelle prescription de médicaments.
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        prescription = serializer.save()
        
        return Response({
            'success': True,
            'data': self.get_serializer(prescription).data
        }, status=status.HTTP_201_CREATED)


class PrescriptionExamenViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les prescriptions d'examens.
    """
    queryset = PrescriptionExamen.objects.all()
    serializer_class = PrescriptionExamenSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """
        Crée une nouvelle prescription d'examen.
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        prescription = serializer.save()
        
        return Response({
            'success': True,
            'data': self.get_serializer(prescription).data
        }, status=status.HTTP_201_CREATED)


class ResultatExamenViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les résultats d'examens.
    """
    queryset = ResultatExamen.objects.all()
    serializer_class = ResultatExamenSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """
        Crée un nouveau résultat d'examen.
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        resultat = serializer.save()
        
        return Response({
            'success': True,
            'data': self.get_serializer(resultat).data
        }, status=status.HTTP_201_CREATED)


class HospitalisationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les hospitalisations.
    """
    queryset = Hospitalisation.objects.all()
    serializer_class = HospitalisationSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request):
        """
        Crée une nouvelle hospitalisation.
        
        Décrémente automatiquement le nombre de places disponibles dans la chambre.
        """
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        hospitalisation = serializer.save()
        
        return Response({
            'success': True,
            'data': self.get_serializer(hospitalisation).data
        }, status=status.HTTP_201_CREATED)


class PatientHistoryViewSet(viewsets.ViewSet):
    """
    ViewSet pour l'historique complet d'un patient.
    
    Permet de récupérer toutes les observations, prescriptions, résultats d'examens
    pour un patient donné (toutes sessions confondues).
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Historique observations patient",
        description="Retourne toutes les observations médicales d'un patient (toutes sessions)"
    )
    @action(detail=False, methods=['get'], url_path='(?P<patient_id>[^/.]+)/observations')
    def observations(self, request, patient_id=None):
        """Récupère toutes les observations d'un patient."""
        from apps.suivi_patient.models import Session, Patient
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Patient non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer toutes les observations via les sessions du patient
        observations = ObservationMedicale.objects.filter(
            id_session__id_patient=patient
        ).select_related('id_personnel', 'id_session').order_by('-date_heure')
        
        serializer = ObservationMedicaleSerializer(observations, many=True)
        
        return Response({
            'success': True,
            'count': observations.count(),
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    @extend_schema(
        summary="Historique prescriptions médicaments patient",
        description="Retourne toutes les prescriptions de médicaments d'un patient"
    )
    @action(detail=False, methods=['get'], url_path='(?P<patient_id>[^/.]+)/prescriptions-medicaments')
    def prescriptions_medicaments(self, request, patient_id=None):
        """Récupère toutes les prescriptions de médicaments d'un patient."""
        from apps.suivi_patient.models import Patient
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Patient non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer toutes les prescriptions via les sessions
        prescriptions = PrescriptionMedicament.objects.filter(
            id_session__id_patient=patient
        ).select_related('id_medecin__personnel_ptr', 'id_session').order_by('-id')
        
        # Serializer personnalisé avec nom du médecin
        data = []
        for presc in prescriptions:
            data.append({
                'id': presc.id,
                'liste_medicaments': presc.liste_medicaments,
                'date_prescription': presc.id_session.debut,
                'medecin_nom': presc.id_medecin.personnel_ptr.nom if presc.id_medecin else 'N/A',
                'medecin_prenom': presc.id_medecin.personnel_ptr.prenom if presc.id_medecin else 'N/A',
                'session_id': presc.id_session.id
            })
        
        return Response({
            'success': True,
            'count': len(data),
            'data': data
        }, status=status.HTTP_200_OK)
    
    @extend_schema(
        summary="Historique prescriptions examens patient",
        description="Retourne toutes les prescriptions d'examens d'un patient"
    )
    @action(detail=False, methods=['get'], url_path='(?P<patient_id>[^/.]+)/prescriptions-examens')
    def prescriptions_examens(self, request, patient_id=None):
        """Récupère toutes les prescriptions d'examens d'un patient."""
        from apps.suivi_patient.models import Patient
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Patient non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer toutes les prescriptions d'examens
        prescriptions = PrescriptionExamen.objects.filter(
            id_session__id_patient=patient
        ).select_related('id_medecin__personnel_ptr', 'id_session').order_by('-id')
        
        data = []
        for presc in prescriptions:
            data.append({
                'id': presc.id,
                'nom_examen': presc.nom_examen,
                'date_prescription': presc.id_session.debut,
                'medecin_nom': presc.id_medecin.personnel_ptr.nom if presc.id_medecin else 'N/A',
                'medecin_prenom': presc.id_medecin.personnel_ptr.prenom if presc.id_medecin else 'N/A',
                'session_id': presc.id_session.id
            })
        
        return Response({
            'success': True,
            'count': len(data),
            'data': data
        }, status=status.HTTP_200_OK)
    
    @extend_schema(
        summary="Historique résultats examens patient",
        description="Retourne tous les résultats d'examens d'un patient"
    )
    @action(detail=False, methods=['get'], url_path='(?P<patient_id>[^/.]+)/resultats-examens')
    def resultats_examens(self, request, patient_id=None):
        """Récupère tous les résultats d'examens d'un patient."""
        from apps.suivi_patient.models import Patient
        
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Patient non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Récupérer tous les résultats via prescriptions->sessions
        resultats = ResultatExamen.objects.filter(
            id_prescription__id_session__id_patient=patient
        ).select_related('id_medecin__personnel_ptr', 'id_prescription').order_by('-id')
        
        data = []
        for res in resultats:
            data.append({
                'id': res.id,
                'nom_examen': res.id_prescription.nom_examen if res.id_prescription else 'N/A',
                'resultat': res.resultat,
                'medecin_nom': res.id_medecin.personnel_ptr.nom if res.id_medecin else 'N/A',
                'medecin_prenom': res.id_medecin.personnel_ptr.prenom if res.id_medecin else 'N/A',
                'prescription_id': res.id_prescription.id if res.id_prescription else None
            })
        
        return Response({
            'success': True,
            'count': len(data),
            'data': data
        }, status=status.HTTP_200_OK)
