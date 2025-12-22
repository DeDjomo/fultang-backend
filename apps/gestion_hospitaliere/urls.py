"""
URLs pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.gestion_hospitaliere.views import (
    AdminViewSet,
    ServiceViewSet,
    PersonnelViewSet,
    MedecinViewSet,
    PatientViewSet,
    RendezVousViewSet,
    InfirmierViewSet,
    MedecinExtendedViewSet,
    PrescriptionMedicamentViewSet,
    PrescriptionExamenViewSet,
    ResultatExamenViewSet,
    HospitalisationViewSet,
    ChambreViewSet,
    SessionViewSet,
    DossierPatientViewSet,
    login_view,
    logout_view,
)
from apps.gestion_hospitaliere.views.caissier_views import CaissierViewSet
from apps.gestion_hospitaliere.views.health_views import health_check

router = DefaultRouter()
router.register(r'admin', AdminViewSet, basename='admin')
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'personnel', PersonnelViewSet, basename='personnel')
router.register(r'medecins', MedecinViewSet, basename='medecin')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'rendez-vous', RendezVousViewSet, basename='rendez-vous')
router.register(r'infirmier', InfirmierViewSet, basename='infirmier')
router.register(r'medecin', MedecinExtendedViewSet, basename='medecin-extended')
router.register(r'prescriptions-medicaments', PrescriptionMedicamentViewSet, basename='prescription-medicament')
router.register(r'prescriptions-examens', PrescriptionExamenViewSet, basename='prescription-examen')
router.register(r'resultats-examens', ResultatExamenViewSet, basename='resultat-examen')
router.register(r'hospitalisations', HospitalisationViewSet, basename='hospitalisation')
router.register(r'chambres', ChambreViewSet, basename='chambre')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'dossiers-patients', DossierPatientViewSet, basename='dossier-patient')
router.register(r'caissier', CaissierViewSet, basename='caissier')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health-check'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]
