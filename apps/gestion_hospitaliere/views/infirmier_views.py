"""
Views pour les endpoints infirmier.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.suivi_patient.models import Session, ObservationMedicale
from apps.gestion_hospitaliere.serializers import (
    SessionSerializer,
    PatientEnAttenteSerializer,
    SelectionnerPatientSerializer,
    ObservationMedicaleSerializer,
    ObservationMedicaleCreateSerializer,
    RedirectionPatientSerializer,
    PatientSerializer,
)


class InfirmierViewSet(viewsets.ViewSet):
    """
    ViewSet pour les endpoints de l'infirmier.

    Endpoints:
    - GET /api/infirmier/patients-en-attente/?service=<nom_service>
    - POST /api/infirmier/selectionner-patient/
    - POST /api/infirmier/observations/
    - POST /api/infirmier/rediriger-patient/
    """

    permission_classes = []  # TEMPORAIRE: Desactive pour tests

    @extend_schema(
        summary="Liste patients en attente (infirmier)",
        description="Retourne tous les patients en attente dans un service pour l'infirmier",
        parameters=[
            OpenApiParameter(
                name='service',
                description='Nom du service',
                required=True,
                type=str
            )
        ],
        responses={200: PatientEnAttenteSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='patients-en-attente')
    def patients_en_attente(self, request):
        """
        Liste des patients en attente dans un service pour infirmier.

        Selon description.md ligne 163:
        - Prend en entree le service de l'infirmier
        - Recherche sessions avec:
          * statut != 'terminee'
          * situation_patient = 'en attente'
          * personnel_responsable = 'infirmier'
        - Retourne patients avec id_session ajoute
        """
        try:
            service = request.query_params.get('service', '').strip()

            if not service:
                return Response(
                    {
                        'error': 'Parametre service manquant',
                        'detail': 'Veuillez fournir le parametre "service".'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Rechercher les sessions selon criteres
            sessions = Session.objects.select_related('id_patient').filter(
                service_courant=service,
                personnel_responsable='infirmier',
                situation_patient='en attente'
            ).exclude(
                statut='terminee'
            )

            # Construire la reponse avec id_session pour chaque patient
            result = []
            for session in sessions:
                patient_data = PatientSerializer(session.id_patient).data
                result.append({
                    'id_session': session.id,
                    'patient': patient_data
                })

            return Response(
                {
                    'success': True,
                    'service': service,
                    'count': len(result),
                    'data': result
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation des patients',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Selectionner un patient",
        description="Change situation_patient a 'recu' lorsque l'infirmier selectionne un patient",
        request=SelectionnerPatientSerializer,
        responses={
            200: SessionSerializer,
            400: OpenApiResponse(description='Donnees invalides'),
            404: OpenApiResponse(description='Session non trouvee')
        }
    )
    @action(detail=False, methods=['post'], url_path='selectionner-patient')
    def selectionner_patient(self, request):
        """
        Selectionne un patient de la liste.

        Selon description.md ligne 164:
        - Prend en entree l'id de la session
        - Change situation_patient a 'recu'
        """
        try:
            serializer = SelectionnerPatientSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Donnees invalides',
                        'detail': 'Veuillez verifier les donnees fournies.',
                        'erreurs': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            id_session = serializer.validated_data['id_session']

            # Recuperer et mettre a jour la session
            try:
                session = Session.objects.get(id=id_session)
                session.situation_patient = 'recu'
                session.save(update_fields=['situation_patient'])

                response_serializer = SessionSerializer(session)

                return Response(
                    {
                        'success': True,
                        'message': 'Patient selectionne avec succes.',
                        'data': response_serializer.data
                    },
                    status=status.HTTP_200_OK
                )

            except Session.DoesNotExist:
                return Response(
                    {
                        'error': 'Session non trouvee',
                        'detail': f'Aucune session trouvee avec l\'ID {id_session}.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la selection du patient',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Enregistrer une observation medicale",
        description="Cree une nouvelle observation medicale",
        request=ObservationMedicaleCreateSerializer,
        responses={
            201: ObservationMedicaleSerializer,
            400: OpenApiResponse(description='Donnees invalides')
        }
    )
    @action(detail=False, methods=['post'], url_path='observations')
    def enregistrer_observation(self, request):
        """
        Enregistre une observation medicale.

        Selon description.md ligne 165:
        - Prend en entree id_personnel, observation, id_session
        - date_heure auto-generee
        """
        try:
            serializer = ObservationMedicaleCreateSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Donnees invalides',
                        'detail': 'Veuillez verifier les donnees fournies.',
                        'erreurs': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            observation = serializer.save()

            response_serializer = ObservationMedicaleSerializer(observation)

            return Response(
                {
                    'success': True,
                    'message': 'Observation medicale enregistree avec succes.',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de l\'enregistrement de l\'observation',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Rediriger un patient",
        description="Redirige un patient vers un service ou un personnel",
        request=RedirectionPatientSerializer,
        responses={
            200: SessionSerializer,
            400: OpenApiResponse(description='Donnees invalides'),
            404: OpenApiResponse(description='Session non trouvee')
        }
    )
    @action(detail=False, methods=['post'], url_path='rediriger-patient')
    def rediriger_patient(self, request):
        """
        Redirige un patient.

        Selon description.md ligne 166:
        - Prend en entree: type_redirection, redirection, id_session
        - Si type='service': change service_courant
        - Si type='personnel': change personnel_responsable
        - Dans tous les cas: situation_patient = 'en attente'
        """
        try:
            serializer = RedirectionPatientSerializer(data=request.data)

            if not serializer.is_valid():
                return Response(
                    {
                        'error': 'Donnees invalides',
                        'detail': 'Veuillez verifier les donnees fournies.',
                        'erreurs': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            id_session = serializer.validated_data['id_session']
            type_redirection = serializer.validated_data['type_redirection']
            redirection = serializer.validated_data['redirection']

            try:
                session = Session.objects.get(id=id_session)

                # Appliquer la redirection
                if type_redirection == 'service':
                    session.service_courant = redirection
                elif type_redirection == 'personnel':
                    session.personnel_responsable = redirection

                # Toujours mettre situation_patient a 'en attente'
                session.situation_patient = 'en attente'

                session.save(update_fields=['service_courant', 'personnel_responsable', 'situation_patient'])

                response_serializer = SessionSerializer(session)

                return Response(
                    {
                        'success': True,
                        'message': f'Patient redirige vers {type_redirection} "{redirection}" avec succes.',
                        'data': response_serializer.data
                    },
                    status=status.HTTP_200_OK
                )

            except Session.DoesNotExist:
                return Response(
                    {
                        'error': 'Session non trouvee',
                        'detail': f'Aucune session trouvee avec l\'ID {id_session}.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la redirection du patient',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
