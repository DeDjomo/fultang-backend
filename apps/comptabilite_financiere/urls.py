"""
URLs de l'application comptabilite_financiere.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.comptabilite_financiere.views import QuittanceViewSet

app_name = 'comptabilite_financiere'

router = DefaultRouter()

# Enregistrer les ViewSets
router.register(r'quittances', QuittanceViewSet, basename='quittance')

urlpatterns = [
    path('', include(router.urls)),
]
