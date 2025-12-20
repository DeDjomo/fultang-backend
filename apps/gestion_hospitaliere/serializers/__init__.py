"""
Package serializers pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from .admin_serializers import AdminSerializer
from .service_serializers import (
    ServiceSerializer,
    ServiceCreateSerializer,
    PersonnelSerializer,
    MedecinSerializer,
    PersonnelCreateSerializer,
    MedecinCreateSerializer,
    PersonnelUpdateSerializer,
    PasswordChangeSerializer,
    PasswordResetSerializer,
    LoginSerializer,
    LogoutSerializer,
)
from .patient_serializers import (
    PatientSerializer,
    PatientCreateSerializer,
    RendezVousSerializer,
    RendezVousCreateSerializer,
)
from .infirmier_serializers import (
    SessionSerializer,
    PatientEnAttenteSerializer,
    SelectionnerPatientSerializer,
    ObservationMedicaleSerializer,
    ObservationMedicaleCreateSerializer,
    RedirectionPatientSerializer,
)
from .medecin_serializers import (
    PrescriptionMedicamentSerializer,
    PrescriptionMedicamentCreateSerializer,
    PrescriptionExamenSerializer,
    PrescriptionExamenCreateSerializer,
    ResultatExamenSerializer,
    ResultatExamenCreateSerializer,
    HospitalisationSerializer,
    HospitalisationCreateSerializer,
    ChambreSerializer,
    ChambreCreateSerializer,
)
from .dossier_patient_serializers import (
    DossierPatientSerializer,
    DossierPatientCreateSerializer,
    DossierPatientUpdateSerializer,
)

__all__ = [
    'AdminSerializer',
    'ServiceSerializer',
    'ServiceCreateSerializer',
    'PersonnelSerializer',
    'MedecinSerializer',
    'PersonnelCreateSerializer',
    'MedecinCreateSerializer',
    'PersonnelUpdateSerializer',
    'PasswordChangeSerializer',
    'PasswordResetSerializer',
    'LoginSerializer',
    'LogoutSerializer',
    'PatientSerializer',
    'PatientCreateSerializer',
    'RendezVousSerializer',
    'RendezVousCreateSerializer',
    'SessionSerializer',
    'PatientEnAttenteSerializer',
    'SelectionnerPatientSerializer',
    'ObservationMedicaleSerializer',
    'ObservationMedicaleCreateSerializer',
    'RedirectionPatientSerializer',
    'PrescriptionMedicamentSerializer',
    'PrescriptionMedicamentCreateSerializer',
    'PrescriptionExamenSerializer',
    'PrescriptionExamenCreateSerializer',
    'ResultatExamenSerializer',
    'ResultatExamenCreateSerializer',
    'HospitalisationSerializer',
    'HospitalisationCreateSerializer',
    'ChambreSerializer',
    'ChambreCreateSerializer',
    'DossierPatientSerializer',
    'DossierPatientCreateSerializer',
    'DossierPatientUpdateSerializer',
]
