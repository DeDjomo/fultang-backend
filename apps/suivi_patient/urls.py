"""
URLs pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.suivi_patient.views import (
    ObservationMedicaleViewSet,
    DossierPatientViewSet,
    PrescriptionMedicamentViewSet,
    PrescriptionExamenViewSet,
    ResultatExamenViewSet,
    HospitalisationViewSet,
    PatientHistoryViewSet
)

router = DefaultRouter()
router.register(r'observations-medicales', ObservationMedicaleViewSet, basename='observations-medicales')
router.register(r'dossiers-patients', DossierPatientViewSet, basename='dossiers-patients')
router.register(r'prescriptions-medicaments', PrescriptionMedicamentViewSet, basename='prescriptions-medicaments')
router.register(r'prescriptions-examens', PrescriptionExamenViewSet, basename='prescriptions-examens')
router.register(r'resultats-examens', ResultatExamenViewSet, basename='resultats-examens')
router.register(r'hospitalisations', HospitalisationViewSet, basename='hospitalisations')
router.register(r'patients', PatientHistoryViewSet, basename='patient-history')

urlpatterns = [
    path('', include(router.urls)),
]
