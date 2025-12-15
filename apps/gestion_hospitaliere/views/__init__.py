"""
Package views pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .admin_views import AdminViewSet
from .service_views import ServiceViewSet
from .personnel_views import PersonnelViewSet
from .medecin_views import MedecinViewSet
from .auth_views import login_view, logout_view
from .patient_views import PatientViewSet
from .rendez_vous_views import RendezVousViewSet
from .infirmier_views import InfirmierViewSet
from .medecin_views_extended import MedecinExtendedViewSet
from .prescription_views import (
    PrescriptionMedicamentViewSet,
    PrescriptionExamenViewSet,
    ResultatExamenViewSet,
    HospitalisationViewSet,
    ChambreViewSet,
)

__all__ = [
    'AdminViewSet',
    'ServiceViewSet',
    'PersonnelViewSet',
    'MedecinViewSet',
    'login_view',
    'logout_view',
    'PatientViewSet',
    'RendezVousViewSet',
    'InfirmierViewSet',
    'MedecinExtendedViewSet',
    'PrescriptionMedicamentViewSet',
    'PrescriptionExamenViewSet',
    'ResultatExamenViewSet',
    'HospitalisationViewSet',
    'ChambreViewSet',
]
