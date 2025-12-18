"""
Views pour le modele Personnel.

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

from apps.gestion_hospitaliere.models import Personnel
from apps.gestion_hospitaliere.serializers import (
    PersonnelSerializer,
    PersonnelCreateSerializer,
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
        summary="Lister tous les personnels",
        description="Retourne la liste de tous les personnels avec filtres et pagination.",
        tags=['Personnel']
    ),
    create=extend_schema(
        summary="Creer un personnel",
        description="Cree un nouveau personnel avec generation automatique du mot de passe et envoi par email.",
        request=PersonnelCreateSerializer,
        responses={201: PersonnelSerializer},
        tags=['Personnel']
    ),
    retrieve=extend_schema(
        summary="Recuperer un personnel",
        description="Retourne les details d'un personnel par son ID.",
        tags=['Personnel']
    ),
    update=extend_schema(
        summary="Mettre a jour un personnel",
        description="Met a jour completement un personnel (sauf mot de passe).",
        request=PersonnelUpdateSerializer,
        responses={200: PersonnelSerializer},
        tags=['Personnel']
    ),
    partial_update=extend_schema(
        summary="Mettre a jour partiellement un personnel",
        description="Met a jour partiellement un personnel (sauf mot de passe).",
        request=PersonnelUpdateSerializer,
        responses={200: PersonnelSerializer},
        tags=['Personnel']
    ),
    destroy=extend_schema(
        summary="Supprimer un personnel",
        description="Supprime un personnel du systeme.",
        tags=['Personnel']
    ),
)
class PersonnelViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les operations CRUD sur Personnel.

    Endpoints:
    - GET /personnel/ : Liste tous les personnels
    - POST /personnel/ : Cree un personnel (auto-genere mot de passe, envoie email)
    - GET /personnel/{id}/ : Recupere un personnel
    - PUT /personnel/{id}/ : Met a jour un personnel
    - PATCH /personnel/{id}/ : Met a jour partiellement un personnel
    - DELETE /personnel/{id}/ : Supprime un personnel
    - POST /personnel/change-password/ : Change son mot de passe
    - POST /personnel/reset-password/ : Admin reset mot de passe
    """

    queryset = Personnel.objects.all().select_related('service')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nom', 'prenom', 'email', 'matricule']
    filterset_fields = ['poste', 'statut', 'service']
    ordering_fields = ['nom', 'prenom', 'date_embauche']

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return PersonnelCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PersonnelUpdateSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        elif self.action == 'reset_password':
            return PasswordResetSerializer
        return PersonnelSerializer

    def create(self, request, *args, **kwargs):
        """Cree un personnel avec mot de passe auto-genere et email."""
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
            personnel = serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Personnel cree avec succes. Un email a ete envoye avec le mot de passe.',
                    'data': PersonnelSerializer(personnel).data
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
        """Met a jour un personnel (sauf mot de passe)."""
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
                'message': 'Personnel mis a jour avec succes.',
                'data': PersonnelSerializer(instance).data
            },
            status=status.HTTP_200_OK
        )

    def list(self, request, *args, **kwargs):
        """Liste tous les personnels."""
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
        """Recupere un personnel par ID."""
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
        """Supprime un personnel."""
        instance = self.get_object()
        nom_complet = f"{instance.nom} {instance.prenom}"
        self.perform_destroy(instance)

        return Response(
            {
                'success': True,
                'message': f'Personnel "{nom_complet}" supprime avec succes.'
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Changer son mot de passe",
        description="Permet a un personnel de changer son propre mot de passe.",
        request=PasswordChangeSerializer,
        responses={200: {'type': 'object', 'properties': {'success': {'type': 'boolean'}, 'message': {'type': 'string'}}}},
        tags=['Personnel']
    )
    @action(detail=False, methods=['post'], url_path='change-password')
    def change_password(self, request):
        """
        POST /personnel/change-password/
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
        user.first_login_done = True  # Marquer premiere connexion faite
        user.password_expiry_date = None  # Effacer expiration
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
        tags=['Personnel']
    )
    @action(detail=False, methods=['post'], url_path='reset-password')
    def reset_password(self, request):
        """
        POST /personnel/reset-password/
        Body: {email}
        Endpoint admin pour reinitialiser le mot de passe d'un personnel.
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
