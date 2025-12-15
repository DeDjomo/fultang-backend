"""
Views pour le modele Patient.

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
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.suivi_patient.models import Patient, RendezVous
from apps.gestion_hospitaliere.serializers import (
    PatientSerializer,
    PatientCreateSerializer,
    RendezVousSerializer,
    RendezVousCreateSerializer,
)


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des patients.

    Endpoints:
    - GET /api/patients/ - Liste tous les patients
    - POST /api/patients/ - Cree un nouveau patient
    - GET /api/patients/{id}/ - Recupere un patient
    - PUT/PATCH /api/patients/{id}/ - Met a jour un patient
    - DELETE /api/patients/{id}/ - Supprime un patient
    - GET /api/patients/search/?q=<text> - Recherche patients par nom/prenom
    - GET /api/patients/hospitalises/ - Liste patients hospitalises
    """

    queryset = Patient.objects.all().select_related('id_personnel')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['nom', 'prenom', 'matricule', 'contact', 'email']
    ordering_fields = ['date_inscription', 'nom']
    ordering = ['-date_inscription']

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return PatientCreateSerializer
        return PatientSerializer

    @extend_schema(
        summary="Liste tous les patients",
        description="Retourne la liste complete des patients",
        responses={200: PatientSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """Liste tous les patients."""
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
                    'error': 'Erreur lors de la recuperation des patients',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Cree un nouveau patient",
        description="Enregistre un nouveau patient avec toutes ses informations",
        request=PatientCreateSerializer,
        responses={
            201: PatientSerializer,
            400: OpenApiResponse(description='Donnees invalides')
        }
    )
    def create(self, request, *args, **kwargs):
        """Cree un nouveau patient."""
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

            patient = serializer.save()

            # Retourner les donnees completes du patient
            response_serializer = PatientSerializer(patient)

            return Response(
                {
                    'success': True,
                    'message': 'Patient cree avec succes.',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la creation du patient',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Recupere un patient",
        description="Retourne les informations detaillees d'un patient",
        responses={
            200: PatientSerializer,
            404: OpenApiResponse(description='Patient non trouve')
        }
    )
    def retrieve(self, request, *args, **kwargs):
        """Recupere un patient specifique."""
        try:
            patient = self.get_object()
            serializer = self.get_serializer(patient)

            return Response(
                {
                    'success': True,
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Patient.DoesNotExist:
            return Response(
                {
                    'error': 'Patient non trouve',
                    'detail': f'Aucun patient trouve avec l\'ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation du patient',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Met a jour un patient",
        description="Modifie les informations d'un patient",
        request=PatientSerializer,
        responses={
            200: PatientSerializer,
            400: OpenApiResponse(description='Donnees invalides'),
            404: OpenApiResponse(description='Patient non trouve')
        }
    )
    def update(self, request, *args, **kwargs):
        """Met a jour un patient."""
        try:
            patient = self.get_object()
            serializer = PatientSerializer(patient, data=request.data, partial=kwargs.get('partial', False))

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
                    'message': 'Patient mis a jour avec succes.',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Patient.DoesNotExist:
            return Response(
                {
                    'error': 'Patient non trouve',
                    'detail': f'Aucun patient trouve avec l\'ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la mise a jour du patient',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Supprime un patient",
        description="Supprime definitivement un patient",
        responses={
            200: OpenApiResponse(description='Patient supprime'),
            404: OpenApiResponse(description='Patient non trouve')
        }
    )
    def destroy(self, request, *args, **kwargs):
        """Supprime un patient."""
        try:
            patient = self.get_object()
            patient_matricule = patient.matricule

            patient.delete()

            return Response(
                {
                    'success': True,
                    'message': f'Patient {patient_matricule} supprime avec succes.'
                },
                status=status.HTTP_200_OK
            )

        except Patient.DoesNotExist:
            return Response(
                {
                    'error': 'Patient non trouve',
                    'detail': f'Aucun patient trouve avec l\'ID {kwargs.get("pk")}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la suppression du patient',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Recherche patients",
        description="Recherche patients par nom ou prenom",
        parameters=[
            OpenApiParameter(
                name='q',
                description='Texte a rechercher dans nom/prenom',
                required=True,
                type=str
            )
        ],
        responses={200: PatientSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='search')
    def search_patients(self, request):
        """Recherche patients par nom ou prenom."""
        try:
            query = request.query_params.get('q', '').strip()

            if not query:
                return Response(
                    {
                        'error': 'Parametre de recherche manquant',
                        'detail': 'Veuillez fournir un parametre "q" pour la recherche.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Recherche dans nom et prenom
            patients = Patient.objects.filter(
                nom__icontains=query
            ) | Patient.objects.filter(
                prenom__icontains=query
            )

            serializer = PatientSerializer(patients, many=True)

            return Response(
                {
                    'success': True,
                    'query': query,
                    'count': patients.count(),
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recherche',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Liste patients hospitalises",
        description="Retourne tous les patients actuellement hospitalises avec leurs informations d'hospitalisation",
        responses={200: PatientSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='hospitalises')
    def liste_hospitalises(self, request):
        """
        Liste tous les patients hospitalises.

        Selon description.md ligne 159:
        - Recherche les patients dont les IDs sont dans la table hospitalisation
        - Retourne les infos patient + debut hospitalisation, statut, numero chambre
        - Recupere l'id de la chambre depuis hospitalisation et cherche le numero
        """
        try:
            from apps.suivi_patient.models import Hospitalisation

            # Recuperer toutes les hospitalisations en cours (pas de date de fin)
            hospitalisations = Hospitalisation.objects.select_related(
                'id_session__id_patient',
                'id_chambre'
            ).filter(
                statut='en cours'  # Hospitalisations en cours
            )

            # Construire la reponse avec informations supplementaires
            result = []
            for hosp in hospitalisations:
                patient = hosp.id_session.id_patient
                patient_data = PatientSerializer(patient).data

                # Ajouter les champs d'hospitalisation
                patient_data['hospitalisation'] = {
                    'debut': hosp.debut,
                    'statut': hosp.statut,
                    'chambre': {
                        'id': hosp.id_chambre.id,
                        'numero_chambre': hosp.id_chambre.numero_chambre,
                        'tarif_journalier': float(hosp.id_chambre.tarif_journalier)
                    }
                }
                result.append(patient_data)

            return Response(
                {
                    'success': True,
                    'count': len(result),
                    'data': result
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation des patients hospitalises',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
