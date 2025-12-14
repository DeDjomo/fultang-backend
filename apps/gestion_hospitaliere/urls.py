"""
URLs pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.gestion_hospitaliere.views import AdminViewSet, ServiceViewSet
from apps.gestion_hospitaliere.views.health_views import health_check

router = DefaultRouter()
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'services', ServiceViewSet, basename='service')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health-check'),
]
