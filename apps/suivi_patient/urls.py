"""
URLs pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# Les viewsets seront ajoutes ulterieurement

urlpatterns = [
    path('', include(router.urls)),
]
