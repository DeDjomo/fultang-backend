"""
Views pour le health check de l'API.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from drf_spectacular.utils import extend_schema
import redis
from django.conf import settings


@extend_schema(
    summary="Tester la sante de l'API",
    description="Verifie que l'API est fonctionnelle et que tous les services sont operationnels.",
    tags=['Health'],
    responses={
        200: {
            'description': 'API fonctionnelle',
            'content': {
                'application/json': {
                    'example': {
                        'success': True,
                        'message': 'API Fultang Hospital est operationnelle.',
                        'services': {
                            'api': 'OK',
                            'database': 'OK',
                            'redis': 'OK'
                        }
                    }
                }
            }
        },
        503: {
            'description': 'Service indisponible'
        }
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint: GET /api/health/

    Verifie la sante de l'API et de ses dependances.
    """
    services_status = {
        'api': 'OK',
        'database': 'UNKNOWN',
        'redis': 'UNKNOWN'
    }

    # Verifier la connexion a la base de donnees
    try:
        connection.ensure_connection()
        services_status['database'] = 'OK'
    except Exception as e:
        services_status['database'] = f'ERROR: {str(e)}'

    # Verifier la connexion a Redis
    try:
        redis_client = redis.Redis.from_url(settings.CELERY_BROKER_URL)
        redis_client.ping()
        services_status['redis'] = 'OK'
    except Exception as e:
        services_status['redis'] = f'ERROR: {str(e)}'

    # Determiner si tous les services sont OK
    all_ok = all(status == 'OK' for status in services_status.values())

    if all_ok:
        return Response(
            {
                'success': True,
                'message': 'API Fultang Hospital est operationnelle.',
                'services': services_status,
                'version': '1.0.0'
            },
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {
                'success': False,
                'message': 'Un ou plusieurs services sont indisponibles.',
                'services': services_status,
                'suggestion': 'Verifiez la connexion a la base de donnees et Redis.'
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
