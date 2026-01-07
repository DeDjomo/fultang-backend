"""
Views pour le modele DossierPatient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.suivi_patient.models import DossierPatient
from apps.gestion_hospitaliere.serializers import (
    DossierPatientSerializer,
    DossierPatientCreateSerializer,
    DossierPatientUpdateSerializer,
)


class DossierPatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des dossiers patients.

    Endpoints:
    - GET /api/dossiers-patients/ - Liste tous les dossiers
    - POST /api/dossiers-patients/ - Cree un nouveau dossier
    - GET /api/dossiers-patients/{id}/ - Recupere un dossier par ID patient
    - PUT/PATCH /api/dossiers-patients/{id}/ - Met a jour un dossier
    - DELETE /api/dossiers-patients/{id}/ - Supprime un dossier
    """

    queryset = DossierPatient.objects.all().select_related('id_patient')
    permission_classes = []  # TEMPORAIRE: Desactive pour tests

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return DossierPatientCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DossierPatientUpdateSerializer
        return DossierPatientSerializer

    @extend_schema(
        summary="Liste tous les dossiers patients",
        description="Retourne la liste complete des dossiers medicaux",
        responses={200: DossierPatientSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """Liste tous les dossiers patients."""
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)

            return Response(
                {
                    'success': True,
                    'count': queryset.count(),
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation des dossiers',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Cree un nouveau dossier patient",
        description="Enregistre un nouveau dossier medical pour un patient",
        request=DossierPatientCreateSerializer,
        responses={
            201: DossierPatientSerializer,
            400: OpenApiResponse(description='Donnees invalides')
        }
    )
    def create(self, request, *args, **kwargs):
        """Cree un nouveau dossier patient."""
        try:
            serializer = self.get_serializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Donnees invalides',
                        'detail': 'Veuillez verifier les donnees fournies.',
                        'erreurs': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            dossier = serializer.save()

            # Retourner les donnees completes du dossier
            response_serializer = DossierPatientSerializer(dossier)

            return Response(
                {
                    'success': True,
                    'message': 'Dossier patient cree avec succes.',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la creation du dossier',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Recupere un dossier patient",
        description="Retourne les informations detaillees d'un dossier medical",
        responses={
            200: DossierPatientSerializer,
            404: OpenApiResponse(description='Dossier non trouve')
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Recupere un dossier patient specifique."""
        try:
            dossier = self.get_object()
            serializer = self.get_serializer(dossier)

            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except DossierPatient.DoesNotExist:
            return Response(
                {
                    'error': 'Dossier non trouve',
                    'detail': f'Aucun dossier trouve pour le patient ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation du dossier',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Met a jour un dossier patient",
        description="Modifie les informations d'un dossier medical",
        request=DossierPatientUpdateSerializer,
        responses={
            200: DossierPatientSerializer,
            400: OpenApiResponse(description='Donnees invalides'),
            404: OpenApiResponse(description='Dossier non trouve')
        }
    )
    def update(self, request, *args, **kwargs):
        """Met a jour un dossier patient."""
        try:
            dossier = self.get_object()
            serializer = self.get_serializer(dossier, data=request.data, partial=kwargs.get('partial', False))

            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Donnees invalides',
                        'detail': 'Veuillez verifier les donnees fournies.',
                        'erreurs': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            dossier = serializer.save()

            # Retourner les donnees completes
            response_serializer = DossierPatientSerializer(dossier)

            return Response(
                {
                    'success': True,
                    'message': 'Dossier patient mis a jour avec succes.',
                    'data': response_serializer.data
                },
                status=status.HTTP_200_OK
            )

        except DossierPatient.DoesNotExist:
            return Response(
                {
                    'error': 'Dossier non trouve',
                    'detail': f'Aucun dossier trouve pour le patient ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la mise a jour du dossier',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Supprime un dossier patient",
        description="Supprime definitivement un dossier medical",
        responses={
            200: OpenApiResponse(description='Dossier supprime'),
            404: OpenApiResponse(description='Dossier non trouve')
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Supprime un dossier patient."""
        try:
            dossier = self.get_object()
            patient_matricule = dossier.id_patient.matricule

            dossier.delete()

            return Response(
                {
                    'success': True,
                    'message': f'Dossier du patient {patient_matricule} supprime avec succes.'
                },
                status=status.HTTP_200_OK
            )

        except DossierPatient.DoesNotExist:
            return Response(
                {
                    'error': 'Dossier non trouve',
                    'detail': f'Aucun dossier trouve pour le patient ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la suppression du dossier',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
