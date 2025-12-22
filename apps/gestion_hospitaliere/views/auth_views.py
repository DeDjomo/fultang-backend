"""
Views pour l'authentification (login/logout).

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse
from apps.gestion_hospitaliere.serializers import LoginSerializer, LogoutSerializer
from apps.gestion_hospitaliere.models import Personnel, Admin


@extend_schema(
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            description='Authentification reussie',
            response={
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                    'data': {
                        'type': 'object',
                        'properties': {
                            'access': {'type': 'string', 'description': 'Token JWT access'},
                            'refresh': {'type': 'string', 'description': 'Token JWT refresh'},
                            'user': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'integer'},
                                    'email': {'type': 'string'},
                                    'matricule': {'type': 'string'},
                                    'nom': {'type': 'string'},
                                    'prenom': {'type': 'string'},
                                    'poste': {'type': 'string'},
                                }
                            }
                        }
                    }
                }
            }
        ),
        400: OpenApiResponse(description='Donnees invalides'),
        401: OpenApiResponse(description='Identifiants incorrects'),
        403: OpenApiResponse(description='Compte bloque ou mot de passe expire'),
    },
    tags=['Authentification'],
    description='Authentifie un utilisateur via email ou matricule et mot de passe.'
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authentifie un utilisateur et retourne les tokens JWT.

    Accepte:
    - Email + mot de passe
    - Matricule + mot de passe

    Bloque si:
    - Mot de passe expire (3 jours sans connexion)
    - Compte bloque (mot de passe = 'interdit')
    - Compte inactif
    """
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {
                'error': 'Donnees invalides',
                'detail': 'Veuillez fournir email/matricule et mot de passe.',
                'erreurs': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    username = serializer.validated_data['username']
    password = serializer.validated_data['password']

    # Authentifier via le backend personnalise
    user = authenticate(request=request, username=username, password=password)

    if user is None:
        # Verifier si le compte existe mais est bloque
        try:
            personnel = Personnel.objects.get(
                email__iexact=username
            ) if '@' in username else Personnel.objects.get(
                matricule__iexact=username
            )

            # Verifier si mot de passe expire
            if personnel.check_password_expired():
                return Response(
                    {
                        'error': 'Mot de passe expire',
                        'detail': 'Votre mot de passe a expire. '
                                  'Contactez l\'administrateur pour un reset.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # Verifier si compte bloque
            if personnel.check_password('interdit'):
                return Response(
                    {
                        'error': 'Compte bloque',
                        'detail': 'Votre compte est bloque. '
                                  'Contactez l\'administrateur.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        except Personnel.DoesNotExist:
            pass

        # Identifiants incorrects
        return Response(
            {
                'error': 'Authentification echouee',
                'detail': 'Email/Matricule ou mot de passe incorrect.'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Generer tokens JWT
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    # Construire la reponse selon le type d'utilisateur
    if isinstance(user, Admin):
        user_data = {
            'id': user.id,
            'login': user.login,
            'role': 'admin'
        }
    else:
        user_data = {
            'id': user.id,
            'email': user.email,
            'matricule': user.matricule,
            'nom': user.nom,
            'prenom': user.prenom,
            'poste': user.poste,
            'statut_de_connexion': user.statut_de_connexion,
            'first_login_done': user.first_login_done,
            'role': 'personnel'
        }

    return Response(
        {
            'success': True,
            'message': 'Connexion reussie.',
            'data': {
                'access': str(access),
                'refresh': str(refresh),
                'user': user_data
            }
        },
        status=status.HTTP_200_OK
    )


@extend_schema(
    request=LogoutSerializer,
    responses={
        200: OpenApiResponse(
            description='Deconnexion reussie',
            response={
                'type': 'object',
                'properties': {
                    'success': {'type': 'boolean'},
                    'message': {'type': 'string'},
                }
            }
        ),
        400: OpenApiResponse(description='Token refresh invalide'),
    },
    tags=['Authentification'],
    description='Deconnecte l\'utilisateur et met a jour son statut.'
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Deconnecte l'utilisateur.

    Met a jour statut_de_connexion = 'inactif'.
    Optionnel: Blacklist le refresh token si fourni.
    """
    try:
        # Mettre a jour statut de connexion
        user = request.user
        user.statut_de_connexion = 'inactif'
        user.save(update_fields=['statut_de_connexion'])

        # Optionnel: Blacklist le refresh token
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                # Si blacklist echoue, continuer quand meme
                pass

        return Response(
            {
                'success': True,
                'message': 'Deconnexion reussie.'
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {
                'error': 'Erreur lors de la deconnexion',
                'detail': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
