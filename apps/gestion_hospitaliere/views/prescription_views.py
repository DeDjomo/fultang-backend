"""
Views pour les prescriptions, resultats, hospitalisations et chambres.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.suivi_patient.models import (
    PrescriptionMedicament,
    PrescriptionExamen,
    ResultatExamen,
    Hospitalisation,
)
from apps.gestion_hospitaliere.models import Chambre
from apps.gestion_hospitaliere.serializers import (
    PrescriptionMedicamentSerializer,
    PrescriptionMedicamentCreateSerializer,
    PrescriptionExamenSerializer,
    PrescriptionExamenCreateSerializer,
    ResultatExamenSerializer,
    ResultatExamenCreateSerializer,
    HospitalisationSerializer,
    HospitalisationCreateSerializer,
    ChambreSerializer,
    ChambreCreateSerializer,
)


class PrescriptionMedicamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les prescriptions de medicaments.

    Endpoints:
    - GET /api/prescriptions-medicaments/ - Liste toutes
    - GET /api/prescriptions-medicaments/?id_medecin=<id> - Par medecin
    - POST /api/prescriptions-medicaments/ - Creer
    """

    queryset = PrescriptionMedicament.objects.all().select_related('id_medecin', 'id_session')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['id_medecin', 'id_session']
    ordering_fields = ['date_heure']
    ordering = ['-date_heure']

    def get_serializer_class(self):
        if self.action == 'create':
            return PrescriptionMedicamentCreateSerializer
        return PrescriptionMedicamentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Donnees invalides',
                'detail': 'Veuillez verifier les donnees fournies.',
                'erreurs': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        prescription = serializer.save()
        response_serializer = PrescriptionMedicamentSerializer(prescription)

        return Response({
            'success': True,
            'message': 'Prescription de medicaments creee avec succes.',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class PrescriptionExamenViewSet(viewsets.ModelViewSet):
    """ViewSet pour les prescriptions d'examens."""

    queryset = PrescriptionExamen.objects.all().select_related('id_medecin', 'id_session')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['id_medecin', 'id_session']
    ordering_fields = ['date_heure']
    ordering = ['-date_heure']

    def get_serializer_class(self):
        if self.action == 'create':
            return PrescriptionExamenCreateSerializer
        return PrescriptionExamenSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Donnees invalides',
                'detail': 'Veuillez verifier les donnees fournies.',
                'erreurs': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        prescription = serializer.save()
        response_serializer = PrescriptionExamenSerializer(prescription)

        return Response({
            'success': True,
            'message': 'Prescription d\'examen creee avec succes.',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class ResultatExamenViewSet(viewsets.ModelViewSet):
    """ViewSet pour les resultats d'examens."""

    queryset = ResultatExamen.objects.all().select_related('id_medecin', 'id_prescription')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['id_medecin', 'id_prescription']
    ordering_fields = ['date_heure']
    ordering = ['-date_heure']

    def get_serializer_class(self):
        if self.action == 'create':
            return ResultatExamenCreateSerializer
        return ResultatExamenSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Donnees invalides',
                'detail': 'Veuillez verifier les donnees fournies.',
                'erreurs': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        resultat = serializer.save()
        response_serializer = ResultatExamenSerializer(resultat)

        return Response({
            'success': True,
            'message': 'Resultat d\'examen enregistre avec succes.',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class HospitalisationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les hospitalisations.

    Note: La creation decremente automatiquement nombre_places_dispo.
    """

    queryset = Hospitalisation.objects.all().select_related(
        'id_session__id_patient', 'id_chambre', 'id_medecin'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['id_medecin', 'id_session', 'id_chambre', 'statut']
    ordering_fields = ['debut']
    ordering = ['-debut']

    def get_serializer_class(self):
        if self.action == 'create':
            return HospitalisationCreateSerializer
        return HospitalisationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Donnees invalides',
                'detail': 'Veuillez verifier les donnees fournies.',
                'erreurs': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            hospitalisation = serializer.save()
            response_serializer = HospitalisationSerializer(hospitalisation)

            return Response({
                'success': True,
                'message': 'Hospitalisation enregistree avec succes. '
                           'Nombre de places disponibles decremente.',
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': 'Erreur lors de l\'enregistrement',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ChambreViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les chambres.

    Filtres disponibles:
    - places_disponibles: Chambres avec au moins 1 place dispo
    - tarif_min: Chambres avec tarif >= valeur
    - tarif_max: Chambres avec tarif <= valeur
    """

    queryset = Chambre.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['tarif_journalier', 'nombre_places_dispo']
    ordering = ['numero_chambre']

    def get_serializer_class(self):
        if self.action == 'create':
            return ChambreCreateSerializer
        return ChambreSerializer

    def get_queryset(self):
        """Applique les filtres personnalises."""
        queryset = super().get_queryset()

        # Filtre: chambres avec places disponibles
        places_dispo = self.request.query_params.get('places_disponibles', None)
        if places_dispo == 'true':
            queryset = queryset.filter(nombre_places_dispo__gt=0)

        # Filtre: tarif minimum
        tarif_min = self.request.query_params.get('tarif_min', None)
        if tarif_min is not None:
            try:
                queryset = queryset.filter(tarif_journalier__gte=float(tarif_min))
            except ValueError:
                pass

        # Filtre: tarif maximum
        tarif_max = self.request.query_params.get('tarif_max', None)
        if tarif_max is not None:
            try:
                queryset = queryset.filter(tarif_journalier__lte=float(tarif_max))
            except ValueError:
                pass

        return queryset

    @extend_schema(
        summary="Liste toutes les chambres",
        description="Retourne toutes les chambres avec filtres optionnels",
        parameters=[
            OpenApiParameter(
                name='places_disponibles',
                description='Filtrer chambres avec places dispo (true)',
                required=False,
                type=str
            ),
            OpenApiParameter(
                name='tarif_min',
                description='Tarif minimum',
                required=False,
                type=float
            ),
            OpenApiParameter(
                name='tarif_max',
                description='Tarif maximum',
                required=False,
                type=float
            )
        ],
        responses={200: ChambreSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        return Response({
            'success': True,
            'count': queryset.count(),
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'error': 'Donnees invalides',
                'detail': 'Veuillez verifier les donnees fournies.',
                'erreurs': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        chambre = serializer.save()
        response_serializer = ChambreSerializer(chambre)

        return Response({
            'success': True,
            'message': 'Chambre creee avec succes.',
            'data': response_serializer.data
        }, status=status.HTTP_201_CREATED)
