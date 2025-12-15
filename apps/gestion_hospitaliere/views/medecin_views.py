"""
Views pour le modele Medecin.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from datetime import timedelta

from apps.gestion_hospitaliere.models import Medecin, Personnel
from apps.gestion_hospitaliere.serializers import (
    MedecinSerializer,
    MedecinCreateSerializer,
    PersonnelUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetSerializer,
)
from apps.gestion_hospitaliere.utils import generate_robust_password
from apps.gestion_hospitaliere.tasks import send_personnel_password_email
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes


@extend_schema_view(
    list=extend_schema(
        summary="Lister tous les medecins",
        description="Retourne la liste de tous les medecins avec filtres et pagination.",
        tags=['Medecins']
    ),
    create=extend_schema(
        summary="Creer un medecin",
        description="Cree un nouveau medecin avec generation automatique du mot de passe et envoi par email.",
        request=MedecinCreateSerializer,
        responses={201: MedecinSerializer},
        tags=['Medecins']
    ),
    retrieve=extend_schema(
        summary="Recuperer un medecin",
        description="Retourne les details d'un medecin par son ID.",
        tags=['Medecins']
    ),
    update=extend_schema(
        summary="Mettre a jour un medecin",
        description="Met a jour completement un medecin (sauf mot de passe).",
        request=PersonnelUpdateSerializer,
        responses={200: MedecinSerializer},
        tags=['Medecins']
    ),
    partial_update=extend_schema(
        summary="Mettre a jour partiellement un medecin",
        description="Met a jour partiellement un medecin (sauf mot de passe).",
        request=PersonnelUpdateSerializer,
        responses={200: MedecinSerializer},
        tags=['Medecins']
    ),
    destroy=extend_schema(
        summary="Supprimer un medecin",
        description="Supprime un medecin du systeme.",
        tags=['Medecins']
    ),
)
class MedecinViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les operations CRUD sur Medecin.

    Endpoints similaires a PersonnelViewSet avec specialisation pour medecins.
    """

    queryset = Medecin.objects.all().select_related('service')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nom', 'prenom', 'email', 'matricule', 'specialite']
    filterset_fields = ['specialite', 'statut', 'service']
    ordering_fields = ['nom', 'prenom', 'specialite']

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return MedecinCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PersonnelUpdateSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        elif self.action == 'reset_password':
            return PasswordResetSerializer
        return MedecinSerializer

    def create(self, request, *args, **kwargs):
        """Cree un medecin avec mot de passe auto-genere et email."""
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
            medecin = serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Medecin cree avec succes. Un email a ete envoye avec le mot de passe.',
                    'data': MedecinSerializer(medecin).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la creation',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Met a jour un medecin (sauf mot de passe)."""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Retirer mot de passe des donnees si fourni
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data.pop('password', None)

        serializer = self.get_serializer(instance, data=data, partial=partial)

        if not serializer.is_valid():
            return Response(
                {
                    'error': 'Erreur de validation',
                    'detail': 'Les donnees fournies ne sont pas valides.',
                    'erreurs': serializer.errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(
            {
                'success': True,
                'message': 'Medecin mis a jour avec succes.',
                'data': MedecinSerializer(instance).data
            },
            status=status.HTTP_200_OK
        )

    def list(self, request, *args, **kwargs):
        """Liste tous les medecins."""
        queryset = self.filter_queryset(self.get_queryset())

        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

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
        """Recupere un medecin par ID."""
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
        """Supprime un medecin."""
        instance = self.get_object()
        nom_complet = f"Dr. {instance.nom} {instance.prenom}"
        self.perform_destroy(instance)

        return Response(
            {
                'success': True,
                'message': f'Medecin "{nom_complet}" supprime avec succes.'
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Changer son mot de passe",
        description="Permet a un medecin de changer son propre mot de passe.",
        request=PasswordChangeSerializer,
        responses={200: {'type': 'object', 'properties': {'success': {'type': 'boolean'}, 'message': {'type': 'string'}}}},
        tags=['Medecins']
    )
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        POST /medecins/change-password/
        Body: {old_password, new_password, confirm_password}
        """
        user = request.user
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

        # Verifier ancien mot de passe
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {
                    'error': 'Mot de passe incorrect',
                    'detail': 'L\'ancien mot de passe est incorrect. Veuillez reessayer.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Definir nouveau mot de passe
        user.set_password(serializer.validated_data['new_password'])
        user.first_login_done = True
        user.password_expiry_date = None
        user.save()

        return Response(
            {
                'success': True,
                'message': 'Mot de passe change avec succes.'
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Reinitialiser le mot de passe (admin)",
        description="Genere un nouveau mot de passe et l'envoie par email (validite 3 jours).",
        request=PasswordResetSerializer,
        responses={200: {'type': 'object', 'properties': {'success': {'type': 'boolean'}, 'message': {'type': 'string'}}}},
        tags=['Medecins']
    )
    @action(detail=False, methods=['post'], url_path='reset-password')
    def reset_password(self, request):
        """
        POST /medecins/reset-password/
        Body: {email}
        Endpoint admin pour reinitialiser le mot de passe d'un medecin.
        """
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

        email = serializer.validated_data['email']
        personnel = Personnel.objects.get(email=email)

        # Generer nouveau mot de passe
        new_password = generate_robust_password()
        personnel.set_password(new_password)
        personnel.first_login_done = False
        personnel.password_expiry_date = timezone.now() + timedelta(days=3)
        personnel.save()

        # Envoyer email asynchrone
        send_personnel_password_email.delay(personnel.id, new_password)

        return Response(
            {
                'success': True,
                'message': f'Un nouveau mot de passe a ete genere et envoye a {email}.'
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Filtrer medecins par specialite",
        description="Retourne la liste des medecins d'une specialite donnee.",
        parameters=[
            OpenApiParameter(
                name='specialite',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Specialite medicale (ex: Cardiologie)',
                required=True
            )
        ],
        responses={200: MedecinSerializer(many=True)},
        tags=['Medecins']
    )
    @action(detail=False, methods=['get'], url_path='by-specialite')
    def filter_by_specialite(self, request):
        """
        GET /medecins/by-specialite/?specialite=Cardiologie
        """
        specialite = request.query_params.get('specialite', '').strip()

        if not specialite:
            return Response(
                {
                    'error': 'Parametre manquant',
                    'detail': 'Le parametre "specialite" est requis. Exemple: ?specialite=Cardiologie'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        medecins = self.get_queryset().filter(specialite__icontains=specialite)
        serializer = self.get_serializer(medecins, many=True)

        return Response(
            {
                'success': True,
                'count': medecins.count(),
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
