"""
Views pour le modele RendezVous.

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
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.suivi_patient.models import RendezVous
from apps.gestion_hospitaliere.serializers import (
    RendezVousSerializer,
    RendezVousCreateSerializer,
)


class RendezVousViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des rendez-vous.

    Endpoints:
    - GET /api/rendez-vous/ - Liste tous les rendez-vous
    - POST /api/rendez-vous/ - Cree un nouveau rendez-vous
    - GET /api/rendez-vous/{id}/ - Recupere un rendez-vous
    - PUT/PATCH /api/rendez-vous/{id}/ - Met a jour un rendez-vous
    - DELETE /api/rendez-vous/{id}/ - Supprime un rendez-vous
    """

    queryset = RendezVous.objects.all().select_related('id_patient', 'id_medecin')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['id_patient', 'id_medecin']
    ordering_fields = ['date_heure']
    ordering = ['date_heure']

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return RendezVousCreateSerializer
        return RendezVousSerializer

    @extend_schema(
        summary="Liste tous les rendez-vous",
        description="Retourne la liste complete des rendez-vous",
        responses={200: RendezVousSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """Liste tous les rendez-vous."""
        try:
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

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation des rendez-vous',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Cree un nouveau rendez-vous",
        description="Prend un rendez-vous entre un patient et un medecin",
        request=RendezVousCreateSerializer,
        responses={
            201: RendezVousSerializer,
            400: OpenApiResponse(description='Donnees invalides')
        }
    )
    def create(self, request, *args, **kwargs):
        """Cree un nouveau rendez-vous."""
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

            rendez_vous = serializer.save()

            # Retourner les donnees completes du rendez-vous
            response_serializer = RendezVousSerializer(rendez_vous)

            return Response(
                {
                    'success': True,
                    'message': 'Rendez-vous cree avec succes.',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la creation du rendez-vous',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Recupere un rendez-vous",
        description="Retourne les informations detaillees d'un rendez-vous",
        responses={
            200: RendezVousSerializer,
            404: OpenApiResponse(description='Rendez-vous non trouve')
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Recupere un rendez-vous specifique."""
        try:
            rendez_vous = self.get_object()
            serializer = self.get_serializer(rendez_vous)

            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except RendezVous.DoesNotExist:
            return Response(
                {
                    'error': 'Rendez-vous non trouve',
                    'detail': f'Aucun rendez-vous trouve avec l\'ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation du rendez-vous',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Met a jour un rendez-vous",
        description="Modifie les informations d'un rendez-vous",
        request=RendezVousSerializer,
        responses={
            200: RendezVousSerializer,
            400: OpenApiResponse(description='Donnees invalides'),
            404: OpenApiResponse(description='Rendez-vous non trouve')
        }
    )
    def update(self, request, *args, **kwargs):
        """Met a jour un rendez-vous."""
        try:
            rendez_vous = self.get_object()
            serializer = RendezVousSerializer(
                rendez_vous,
                data=request.data,
                partial=kwargs.get('partial', False)
            )

            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Donnees invalides',
                        'detail': 'Veuillez verifier les donnees fournies.',
                        'erreurs': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save()

            return Response(
                {
                    'success': True,
                    'message': 'Rendez-vous mis a jour avec succes.',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except RendezVous.DoesNotExist:
            return Response(
                {
                    'error': 'Rendez-vous non trouve',
                    'detail': f'Aucun rendez-vous trouve avec l\'ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la mise a jour du rendez-vous',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Supprime un rendez-vous",
        description="Supprime definitivement un rendez-vous",
        responses={
            200: OpenApiResponse(description='Rendez-vous supprime'),
            404: OpenApiResponse(description='Rendez-vous non trouve')
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Supprime un rendez-vous."""
        try:
            rendez_vous = self.get_object()
            rendez_vous_id = rendez_vous.id

            rendez_vous.delete()

            return Response(
                {
                    'success': True,
                    'message': f'Rendez-vous {rendez_vous_id} supprime avec succes.'
                },
                status=status.HTTP_200_OK
            )

        except RendezVous.DoesNotExist:
            return Response(
                {
                    'error': 'Rendez-vous non trouve',
                    'detail': f'Aucun rendez-vous trouve avec l\'ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la suppression du rendez-vous',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='medecin/(?P<medecin_id>[^/.]+)')
    @extend_schema(
        summary="Rendez-vous d'un médecin",
        description="Retourne tous les rendez-vous d'un médecin spécifique",
        responses={
            200: RendezVousSerializer(many=True),
            404: OpenApiResponse(description='Médecin non trouvé')
        }
    )
    def by_medecin(self, request, medecin_id=None):
        """
        Récupère tous les rendez-vous d'un médecin.
        
        GET /api/rendez-vous/medecin/{medecin_id}/
        """
        try:
            from apps.gestion_hospitaliere.models import Medecin
            
            # Vérifier que le médecin existe
            try:
                medecin = Medecin.objects.get(id=medecin_id)
            except Medecin.DoesNotExist:
                return Response(
                    {
                        'error': 'Médecin non trouvé',
                        'detail': f'Aucun médecin trouvé avec l\'ID {medecin_id}.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Récupérer tous les rendez-vous du médecin
            rendez_vous = self.get_queryset().filter(id_medecin=medecin_id).order_by('-date_heure')
            serializer = self.get_serializer(rendez_vous, many=True)
            
            return Response(
                {
                    'success': True,
                    'count': rendez_vous.count(),
                    'medecin': {
                        'id': medecin.id,
                        'nom': medecin.nom,
                        'prenom': medecin.prenom,
                        'specialite': medecin.specialite
                    },
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la récupération des rendez-vous',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
