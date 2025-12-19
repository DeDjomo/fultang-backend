"""
Views pour le modele Session.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-19
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from apps.suivi_patient.models import Session
from apps.gestion_hospitaliere.models import Service
from apps.gestion_hospitaliere.serializers.session_serializers import (
    SessionSerializer,
    SessionCreateSerializer,
    SessionUpdateSerializer,
)


class SessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des sessions.

    Endpoints:
    - GET /api/sessions/ - Liste toutes les sessions
    - POST /api/sessions/ - Cree une nouvelle session (ouvrir session)
    - GET /api/sessions/{id}/ - Recupere une session
    - PATCH /api/sessions/{id}/ - Met a jour une session
    - DELETE /api/sessions/{id}/ - Supprime une session
    - GET /api/sessions/en-cours/ - Liste les sessions en cours
    - POST /api/sessions/{id}/terminer/ - Termine une session
    - POST /api/sessions/{id}/rediriger/ - Redirige un patient
    - POST /api/sessions/{id}/selectionner/ - Selectionne un patient (situation -> recu)
    - GET /api/sessions/patients-attente/{service}/ - Liste patients en attente pour un service
    """

    queryset = Session.objects.all().select_related('id_patient', 'id_personnel')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['id_patient', 'statut', 'situation_patient', 'service_courant']
    ordering_fields = ['debut', 'id_patient']
    ordering = ['-debut']

    def get_serializer_class(self):
        """Retourne le serializer approprie selon l'action."""
        if self.action == 'create':
            return SessionCreateSerializer
        if self.action in ['partial_update', 'update']:
            return SessionUpdateSerializer
        return SessionSerializer

    @extend_schema(
        summary="Liste toutes les sessions",
        description="Retourne la liste complete des sessions",
        responses={200: SessionSerializer(many=True)}
    )
    def list(self, request, *args, **kwargs):
        """Liste toutes les sessions."""
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
                    'error': 'Erreur lors de la recuperation des sessions',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Ouvre une nouvelle session",
        description="Cree une nouvelle session pour un patient",
        request=SessionCreateSerializer,
        responses={
            201: SessionSerializer,
            400: OpenApiResponse(description='Donnees invalides')
        }
    )
    def create(self, request, *args, **kwargs):
        """Cree une nouvelle session."""
        try:
            from apps.gestion_hospitaliere.models import Personnel
            
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

            # Recuperer le service pour prendre le nom
            id_service = serializer.validated_data['id_service']
            service = Service.objects.get(id=id_service)

            # Determiner le personnel qui ouvre la session
            id_personnel = request.data.get('id_personnel')
            if id_personnel:
                # Si id_personnel est fourni dans la requete
                try:
                    personnel = Personnel.objects.get(id=id_personnel)
                except Personnel.DoesNotExist:
                    return Response(
                        {
                            'error': 'Personnel non trouve',
                            'detail': f'Aucun personnel trouve avec l\'ID {id_personnel}.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif hasattr(request.user, 'poste'):
                # L'utilisateur connecte est un Personnel
                personnel = request.user
            else:
                # L'utilisateur est Admin ou autre - prendre le premier personnel actif
                personnel = Personnel.objects.filter(statut='actif').first()
                if not personnel:
                    return Response(
                        {
                            'error': 'Aucun personnel disponible',
                            'detail': 'Veuillez fournir un id_personnel dans la requete.'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Creer la session
            session = Session.objects.create(
                id_patient_id=serializer.validated_data['id_patient'],
                id_personnel=personnel,
                service_courant=service.nom_service,
                personnel_responsable='infirmier',  # Par defaut selon description.md
                statut='en cours',
                situation_patient='en attente'
            )

            response_serializer = SessionSerializer(session)

            return Response(
                {
                    'success': True,
                    'message': 'Session ouverte avec succes.',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la creation de la session',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Liste les sessions en cours",
        description="Retourne toutes les sessions dont le statut n'est pas 'terminee'",
        responses={200: SessionSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='en-cours')
    def en_cours(self, request):
        """Liste les sessions en cours."""
        try:
            queryset = self.get_queryset().exclude(statut='terminee')
            serializer = SessionSerializer(queryset, many=True)

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
                    'error': 'Erreur lors de la recuperation des sessions en cours',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Termine une session",
        description="Met le statut de la session a 'terminee' et enregistre la date de fin",
        responses={200: SessionSerializer}
    )
    @action(detail=True, methods=['post'], url_path='terminer')
    def terminer(self, request, pk=None):
        """Termine une session."""
        try:
            from django.utils import timezone
            session = self.get_object()
            session.statut = 'terminee'
            session.fin = timezone.now()
            session.save()

            serializer = SessionSerializer(session)

            return Response(
                {
                    'success': True,
                    'message': 'Session terminee avec succes.',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Session.DoesNotExist:
            return Response(
                {
                    'error': 'Session non trouvee',
                    'detail': f'Aucune session trouvee avec l\'ID {pk}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la terminaison de la session',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Selectionne un patient",
        description="Met la situation_patient a 'recu' (infirmier/medecin selectionne un patient)",
        responses={200: SessionSerializer}
    )
    @action(detail=True, methods=['post'], url_path='selectionner')
    def selectionner(self, request, pk=None):
        """Selectionne un patient - met situation_patient a 'recu'."""
        try:
            session = self.get_object()
            session.situation_patient = 'recu'
            session.save()

            serializer = SessionSerializer(session)

            return Response(
                {
                    'success': True,
                    'message': 'Patient selectionne avec succes.',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Session.DoesNotExist:
            return Response(
                {
                    'error': 'Session non trouvee',
                    'detail': f'Aucune session trouvee avec l\'ID {pk}.'
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
        summary="Redirige un patient",
        description="Redirige vers un service ou vers un personnel. Params: type=service|personnel, valeur=nom",
        parameters=[
            OpenApiParameter(name='type', description='service ou personnel', required=True, type=str),
            OpenApiParameter(name='valeur', description='Nom du service ou poste', required=True, type=str),
        ],
        responses={200: SessionSerializer}
    )
    @action(detail=True, methods=['post'], url_path='rediriger')
    def rediriger(self, request, pk=None):
        """Redirige un patient vers un service ou un personnel."""
        try:
            session = self.get_object()
            type_redir = request.data.get('type')
            valeur = request.data.get('valeur')

            if not type_redir or not valeur:
                return Response(
                    {
                        'error': 'Parametres manquants',
                        'detail': 'Les parametres "type" et "valeur" sont obligatoires.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if type_redir == 'service':
                # Verifier que le service existe
                if not Service.objects.filter(nom_service__iexact=valeur).exists():
                    return Response(
                        {
                            'error': 'Service non trouve',
                            'detail': f'Aucun service trouve avec le nom "{valeur}".'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                session.service_courant = valeur
            elif type_redir == 'personnel':
                postes_valides = ['receptioniste', 'caissier', 'infirmier', 'medecin',
                                'laborantin', 'pharmacien', 'comptable', 'directeur']
                if valeur.lower() not in postes_valides:
                    return Response(
                        {
                            'error': 'Poste invalide',
                            'detail': f'Poste invalide. Valeurs acceptees: {", ".join(postes_valides)}'
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )
                session.personnel_responsable = valeur.lower()
            else:
                return Response(
                    {
                        'error': 'Type de redirection invalide',
                        'detail': 'Le type doit etre "service" ou "personnel".'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Remettre situation_patient a 'en attente' apres redirection
            session.situation_patient = 'en attente'
            session.save()

            serializer = SessionSerializer(session)

            return Response(
                {
                    'success': True,
                    'message': 'Patient redirige avec succes.',
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Session.DoesNotExist:
            return Response(
                {
                    'error': 'Session non trouvee',
                    'detail': f'Aucune session trouvee avec l\'ID {pk}.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la redirection',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        summary="Liste patients en attente pour un poste",
        description="Patients en attente pour un poste (infirmier/medecin) dans un service",
        parameters=[
            OpenApiParameter(name='service', description='Nom du service', required=True, type=str),
            OpenApiParameter(name='poste', description='Poste (infirmier, medecin)', required=True, type=str),
        ],
        responses={200: SessionSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='patients-attente')
    def patients_attente(self, request):
        """Liste les patients en attente pour un poste dans un service."""
        try:
            service = request.query_params.get('service')
            poste = request.query_params.get('poste')

            if not service or not poste:
                return Response(
                    {
                        'error': 'Parametres manquants',
                        'detail': 'Les parametres "service" et "poste" sont obligatoires.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            queryset = self.get_queryset().filter(
                service_courant__iexact=service,
                personnel_responsable__iexact=poste,
                situation_patient='en attente'
            ).exclude(statut='terminee')

            # Ajouter id_session aux donnees patient
            patients_data = []
            for session in queryset:
                patient = session.id_patient
                patients_data.append({
                    'id': patient.id,
                    'matricule': patient.matricule,
                    'nom': patient.nom,
                    'prenom': patient.prenom,
                    'contact': patient.contact,
                    'id_session': session.id,
                    'service_courant': session.service_courant,
                    'debut_session': session.debut
                })

            return Response(
                {
                    'success': True,
                    'count': len(patients_data),
                    'data': patients_data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors de la recuperation des patients en attente',
                    'detail': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
