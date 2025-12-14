"""
Views pour le modele Admin.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from rest_framework import viewsets, status, mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from apps.gestion_hospitaliere.models import Admin
from apps.gestion_hospitaliere.serializers import AdminSerializer
from drf_spectacular.utils import extend_schema


class AdminViewSet(mixins.CreateModelMixin,
                   mixins.ListModelMixin,
                   viewsets.GenericViewSet):
    """
    ViewSet pour la gestion de l'administrateur systeme.

    Endpoints disponibles:
    - GET /admin/ : Recuperer l'administrateur unique
    - POST /admin/ : Creer l'administrateur (une seule fois)
    - PUT /admin/ : Mettre a jour l'administrateur (pas besoin d'ID)
    - PATCH /admin/ : Mettre a jour partiellement l'administrateur (pas besoin d'ID)

    Note: Il n'y a qu'un seul administrateur dans le systeme.
    """

    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Recuperer l'administrateur",
        description="Retourne l'administrateur unique du systeme.",
        tags=['Admin'],
        responses={200: AdminSerializer}
    )
    def list(self, request, *args, **kwargs):
        """Retourne l'administrateur unique."""
        queryset = self.filter_queryset(self.get_queryset())

        if not queryset.exists():
            return Response(
                {
                    'success': True,
                    'message': 'Aucun administrateur trouve.',
                    'data': None,
                    'suggestion': 'Creez un administrateur avec POST /api/admin/'
                },
                status=status.HTTP_200_OK
            )

        # Retourne l'admin unique
        admin = queryset.first()
        serializer = self.get_serializer(admin)
        return Response(
            {
                'success': True,
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Creer l'administrateur (une seule fois)",
        description="Cree l'administrateur du systeme. Une seule entree autorisee.",
        tags=['Admin'],
        request=AdminSerializer,
        responses={201: AdminSerializer}
    )
    def create(self, request, *args, **kwargs):
        """Cree l'administrateur avec validation stricte."""
        if Admin.objects.exists():
            return Response(
                {
                    'error': 'Conflit de creation',
                    'detail': 'Un administrateur existe deja dans le systeme. '
                             'Impossible de creer un nouvel administrateur.',
                    'suggestion': 'Utilisez PUT /api/admin/ ou PATCH /api/admin/ '
                                'pour modifier l\'administrateur existant (pas besoin d\'ID).'
                },
                status=status.HTTP_409_CONFLICT
            )

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

        self.perform_create(serializer)
        return Response(
            {
                'success': True,
                'message': 'Administrateur cree avec succes.',
                'data': serializer.data
            },
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        summary="Mettre a jour l'administrateur",
        description="Met a jour completement les informations de l'administrateur. L'ID n'est pas necessaire car il n'y a qu'un seul administrateur.",
        tags=['Admin'],
        request=AdminSerializer,
        responses={200: AdminSerializer},
        methods=['PUT']
    )
    @action(detail=False, methods=['put'], url_path='')
    def update_admin(self, request):
        """Met a jour l'administrateur unique (PUT sur /admin/)."""
        admin = Admin.objects.first()
        if not admin:
            return Response(
                {
                    'error': 'Administrateur non trouve',
                    'detail': 'Aucun administrateur n\'existe dans le systeme.',
                    'suggestion': 'Creez un administrateur avec POST /api/admin/'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(admin, data=request.data, partial=False)
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
                'message': 'Administrateur mis a jour avec succes.',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @extend_schema(
        summary="Mettre a jour partiellement l'administrateur",
        description="Met a jour partiellement les informations de l'administrateur. L'ID n'est pas necessaire car il n'y a qu'un seul administrateur.",
        tags=['Admin'],
        request=AdminSerializer,
        responses={200: AdminSerializer},
        methods=['PATCH']
    )
    @action(detail=False, methods=['patch'], url_path='')
    def partial_update_admin(self, request):
        """Met a jour partiellement l'administrateur unique (PATCH sur /admin/)."""
        admin = Admin.objects.first()
        if not admin:
            return Response(
                {
                    'error': 'Administrateur non trouve',
                    'detail': 'Aucun administrateur n\'existe dans le systeme.',
                    'suggestion': 'Creez un administrateur avec POST /api/admin/'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(admin, data=request.data, partial=True)
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
                'message': 'Administrateur mis a jour avec succes.',
                'data': serializer.data
            },
            status=status.HTTP_200_OK
        )
