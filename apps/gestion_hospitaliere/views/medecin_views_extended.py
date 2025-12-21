"""
Views pour les endpoints medecin (etendus).

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
from apps.suivi_patient.models import Session, ObservationMedicale, Patient
from apps.gestion_hospitaliere.serializers import (
    SessionSerializer,
    PatientEnAttenteSerializer,
    SelectionnerPatientSerializer,
    ObservationMedicaleSerializer,
    ObservationMedicaleCreateSerializer,
    RedirectionPatientSerializer,
    PatientSerializer,
)


class MedecinExtendedViewSet(viewsets.ViewSet):
    """
    ViewSet pour les endpoints du medecin.

    Endpoints:
    - GET /api/medecin/patients-en-attente/?service=<nom_service>
    - POST /api/medecin/selectionner-patient/
    - POST /api/medecin/observations/
    - GET /api/medecin/dossier-patient/{id}/
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Liste patients en attente (medecin)",
        description="Retourne tous les patients en attente dans un service pour le medecin",
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
        Liste des patients en attente dans un service pour medecin.

        Selon description.md ligne 170:
        - Prend en entree le service du medecin
        - Recherche sessions avec:
          * statut != 'terminee'
          * situation_patient = 'en attente'
          * personnel_responsable = 'medecin'
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
                personnel_responsable='medecin',
                situation_patient='en attente'
            ).exclude(
                statut='terminee'
            )

            # Construire la reponse avec donnees patients aplaties + id_session
            result = []
            for session in sessions:
                patient = session.id_patient
                patient_data = {
                    'id': patient.id,
                    'nom': patient.nom,
                    'prenom': patient.prenom,
                    'matricule': patient.matricule,
                    'contact': patient.contact,
                    'date_naissance': patient.date_naissance,
                    'age': patient.get_age() if hasattr(patient, 'get_age') else None,
                    'id_session': session.id,
                    'debut_session': session.debut,
                }
                result.append(patient_data)

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
        description="Change situation_patient a 'recu' lorsque le medecin selectionne un patient",
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

        Selon description.md ligne 171:
        - Identique a l'infirmier
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

        Selon description.md ligne 172:
        - Identique a l'infirmier
        - Prend en entree id_personnel, observation, id_session
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
        summary="Consulter dossier patient",
        description="Retourne toutes les informations du dossier d'un patient",
        responses={
            200: OpenApiResponse(description='Dossier patient complet'),
            404: OpenApiResponse(description='Patient non trouve')
        }
    )
    @action(detail=False, methods=['get'], url_path='consulter-dossier/(?P<patient_id>[^/.]+)')
    def consulter_dossier_patient(self, request, patient_id=None):
        """
        Consulte le dossier complet d'un patient.

        Selon description.md ligne 173:
        - Prend en entree l'id du patient
        - Retourne toutes les informations du patient + historique
        """
        try:

            try:
                patient = Patient.objects.get(id=patient_id)
            except Patient.DoesNotExist:
                return Response(
                    {
                        'error': 'Patient non trouve',
                        'detail': f'Aucun patient trouve avec l\'ID {patient_id}.'
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Informations de base du patient
            patient_data = PatientSerializer(patient).data

            # Recuperer toutes les sessions du patient
            sessions = Session.objects.filter(id_patient=patient).order_by('-debut')
            sessions_data = SessionSerializer(sessions, many=True).data

            # Recuperer toutes les observations medicales du patient
            observations = ObservationMedicale.objects.filter(
                id_session__id_patient=patient
            ).order_by('-date_heure')
            observations_data = ObservationMedicaleSerializer(observations, many=True).data

            # Recuperer les rendez-vous du patient
            from apps.suivi_patient.models import RendezVous
            rendez_vous = RendezVous.objects.filter(id_patient=patient).order_by('-date_heure')
            from apps.gestion_hospitaliere.serializers import RendezVousSerializer
            rendez_vous_data = RendezVousSerializer(rendez_vous, many=True).data

            # Recuperer les hospitalisations du patient
            from apps.suivi_patient.models import Hospitalisation
            hospitalisations = Hospitalisation.objects.filter(
                id_session__id_patient=patient
            ).order_by('-debut')

            hospitalisations_data = []
            for hosp in hospitalisations:
                hospitalisations_data.append({
                    'id': hosp.id,
                    'debut': hosp.debut,
                    'fin': hosp.fin,
                    'statut': hosp.statut,
                    'chambre': {
                        'numero_chambre': hosp.id_chambre.numero_chambre,
                        'tarif_journalier': float(hosp.id_chambre.tarif_journalier)
                    },
                    'medecin': {
                        'nom': hosp.id_medecin.nom,
                        'prenom': hosp.id_medecin.prenom,
                        'specialite': hosp.id_medecin.specialite
                    }
                })

            return Response(
                {
                    'success': True,
                    'data': {
                        'patient': patient_data,
                        'sessions': sessions_data,
                        'observations_medicales': observations_data,
                        'rendez_vous': rendez_vous_data,
                        'hospitalisations': hospitalisations_data
                    }
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la consultation du dossier',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
