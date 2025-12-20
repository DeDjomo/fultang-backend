"""
Views pour le modele Service.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from apps.gestion_hospitaliere.models import Service, Personnel, Medecin
from apps.gestion_hospitaliere.serializers import (
    ServiceSerializer,
    ServiceCreateSerializer,
    PersonnelSerializer,
    MedecinSerializer,
)
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        summary="Lire tous les services",
        description="Retourne la liste de tous les services de l'hopital.",
        tags=['Services']
    ),
    create=extend_schema(
        summary="Creer un service",
        description="Cree un nouveau service avec son chef de service.",
        request=ServiceCreateSerializer,
        responses={201: ServiceSerializer},
        tags=['Services']
    ),
    retrieve=extend_schema(
        summary="Recuperer un service par ID",
        description="Retourne les details d'un service specifique par son ID.",
        tags=['Services']
    ),
    update=extend_schema(
        summary="Mettre a jour un service",
        description="Met a jour completement un service.",
        tags=['Services']
    ),
    partial_update=extend_schema(
        summary="Mettre a jour partiellement un service",
        description="Met a jour partiellement un service.",
        tags=['Services']
    ),
    destroy=extend_schema(
        summary="Supprimer un service",
        description="Supprime un service.",
        tags=['Services']
    ),
)
class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des services de l'hopital.

    Endpoints:
    - GET /services/ : Liste tous les services
    - POST /services/ : Cree un nouveau service avec son chef
    - GET /services/{id}/ : Recupere un service par ID
    - PUT/PATCH /services/{id}/ : Modifie un service
    - DELETE /services/{id}/ : Supprime un service
    - GET /services/{id}/personnel/ : Liste le personnel d'un service
    - GET /services/{id}/medecins/ : Liste les medecins d'un service
    """

    queryset = Service.objects.all().select_related('chef_service')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return ServiceCreateSerializer
        return ServiceSerializer

    def create(self, request, *args, **kwargs):
        """Cree un service avec son chef."""
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    'error': 'Erreur de validation',
                    'detail': 'Les donnees fournies ne sont pas valides.',
                    'erreurs': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            service = serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Service cree avec succes.',
                    'data': ServiceSerializer(service).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la creation',
                    'detail': str(e),
                    'suggestion': 'Verifiez que toutes les donnees sont correctes et reessayez.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Met a jour un service."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Retirer chef_service des donnees pour utiliser chef_email a la place
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data.pop('chef_service', None)

        serializer = ServiceSerializer(instance, data=data, partial=partial)

        if not serializer.is_valid():
            return Response(
                {
                    'error': 'Erreur de validation',
                    'detail': 'Les donnees fournies ne sont pas valides.',
                    'erreurs': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_update(serializer)
        return Response(
            {
                'success': True,
                'message': 'Service mis a jour avec succes.',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    def list(self, request, *args, **kwargs):
        """Liste tous les services."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                'success': True,
                'count': queryset.count(),
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, *args, **kwargs):
        """Recupere un service par ID."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        return Response(
            {
                'success': True,
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        """Supprime un service avec suppression en cascade des objets liés."""
        instance = self.get_object()
        service_nom = instance.nom_service

        # Suppression en cascade manuelle des objets liés
        # 1. Supprimer tous les personnels du service (qui supprimera leurs patients, sessions, etc.)
        personnels_count = instance.personnels.count()
        for personnel in instance.personnels.all():
            # Supprimer les objets liés au personnel
            for patient in personnel.patients_enregistres.all():
                patient.rendez_vous.all().delete()
                patient.sessions.all().delete()
                patient.delete()
            personnel.sessions_ouvertes.all().delete()
            if hasattr(personnel, 'besoins_emis'):
                personnel.besoins_emis.all().delete()
            if hasattr(personnel, 'sorties_effectuees'):
                personnel.sorties_effectuees.all().delete()
            personnel.delete()

        # 2. Supprimer tous les médecins du service (héritage de Personnel)
        medecins_count = Medecin.objects.filter(service=instance).count()
        for medecin in Medecin.objects.filter(service=instance):
            # Supprimer les rendez-vous du médecin
            medecin.rendez_vous.all().delete()
            # Supprimer les hospitalisations supervisées par ce médecin
            if hasattr(medecin, 'hospitalisations'):
                medecin.hospitalisations.all().delete()
            # Supprimer les objets liés au personnel (patients, sessions, etc.)
            for patient in medecin.patients_enregistres.all():
                patient.rendez_vous.all().delete()
                patient.sessions.all().delete()
                patient.delete()
            medecin.sessions_ouvertes.all().delete()
            if hasattr(medecin, 'besoins_emis'):
                medecin.besoins_emis.all().delete()
            if hasattr(medecin, 'sorties_effectuees'):
                medecin.sorties_effectuees.all().delete()
            medecin.delete()

        # 3. Supprimer le service
        self.perform_destroy(instance)

        return Response(
            {
                'success': True,
                'message': f'Service "{service_nom}" supprime avec succes.',
                'details': {
                    'personnels_supprimes': personnels_count,
                    'medecins_supprimes': medecins_count
                }
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Voir tout le personnel d'un service",
        description="Retourne la liste de tout le personnel affecte a un service specifique.",
        tags=['Services'],
        responses={200: PersonnelSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='personnel')
    def get_personnel(self, request, pk=None):
        """
        Endpoint: GET /services/{id}/personnel/

        Retourne la liste de tout le personnel affecte a un service.
        """
        service = self.get_object()
        personnel = Personnel.objects.filter(service=service).select_related('service')

        if not personnel.exists():
            return Response(
                {
                    'success': True,
                    'message': f'Aucun personnel trouve pour le service "{service.nom_service}".',
                    'count': 0,
                    'data': []
                },
                status=status.HTTP_200_OK
            )

        serializer = PersonnelSerializer(personnel, many=True)
        return Response(
            {
                'success': True,
                'service': service.nom_service,
                'count': personnel.count(),
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Voir tous les medecins d'un service",
        description="Retourne la liste de tous les medecins affectes a un service specifique.",
        tags=['Services'],
        responses={200: MedecinSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='medecins')
    def get_medecins(self, request, pk=None):
        """
        Endpoint: GET /services/{id}/medecins/

        Retourne la liste de tous les medecins affectes a un service.
        """
        service = self.get_object()
        medecins = Medecin.objects.filter(service=service).select_related('service')

        if not medecins.exists():
            return Response(
                {
                    'success': True,
                    'message': f'Aucun medecin trouve pour le service "{service.nom_service}".',
                    'count': 0,
                    'data': []
                },
                status=status.HTTP_200_OK
            )

        serializer = MedecinSerializer(medecins, many=True)
        return Response(
            {
                'success': True,
                'service': service.nom_service,
                'count': medecins.count(),
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Rechercher un service par nom",
        description="Recherche et retourne un service par son nom exact.",
        tags=['Services'],
        parameters=[
            OpenApiParameter(
                name='nom',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Nom du service a rechercher',
                required=True
            )
        ],
        responses={200: ServiceSerializer}
    )
    @action(detail=False, methods=['get'], url_path='recherche')
    def recherche_par_nom(self, request):
        """
        Endpoint: GET /services/recherche/?nom=Cardiologie

        Recherche un service par son nom exact.
        """
        nom_service = request.query_params.get('nom', '').strip()

        if not nom_service:
            return Response(
                {
                    'error': 'Parametre manquant',
                    'detail': 'Le parametre "nom" est requis.',
                    'suggestion': 'Utilisez /api/services/recherche/?nom=NomDuService'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            service = Service.objects.get(nom_service__iexact=nom_service)
            serializer = self.get_serializer(service)
            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Service.DoesNotExist:
            return Response(
                {
                    'error': 'Service non trouve',
                    'detail': f'Aucun service trouve avec le nom "{nom_service}".',
                    'suggestion': 'Verifiez l\'orthographe ou utilisez GET /api/services/ pour voir tous les services.'
                },
                status=status.HTTP_404_NOT_FOUND
            )
