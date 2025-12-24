import os, sys, django, random
from datetime import datetime, timedelta
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.dev')
django.setup()

from apps.gestion_hospitaliere.models import Service, Personnel, Medecin
from apps.suivi_patient.models import Patient, DossierPatient, Session, ObservationMedicale

FIRST_NAMES = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Thomas', 'Julie', 'Nicolas', 'Emma', 'Alexandre']
LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau']
BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
OBSERVATIONS = ['Patient stable', 'Bonne évolution', 'Patient présente douleurs', 'Température 37.2°C']

print("\n🗑️ Nettoyage...")
ObservationMedicale.objects.all().delete()
Session.objects.all().delete()
DossierPatient.objects.all().delete()
Patient.objects.all().delete()

print("\n👥 Création de 30 patients...")
personnels = list(Personnel.objects.all())
patients = []
for i in range(30):
    age = random.randint(18, 80)
    patient = Patient.objects.create(
        nom=random.choice(LAST_NAMES), prenom=random.choice(FIRST_NAMES),
        date_naissance=datetime.now().date() - timedelta(days=age*365),
        contact=str(670000000 + i*100), contact_proche=str(690000000 + i*100),
        nom_proche=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
        adresse=f"{random.randint(1,999)} Rue Yaoundé", id_personnel=random.choice(personnels)
    )
    DossierPatient.objects.create(
        id_patient=patient, groupe_sanguin=random.choice(BLOOD_GROUPS),
        facteur_rhesus=random.choice(['+', '-']), poids=round(random.uniform(50,100),1),
        taille=round(random.uniform(150,190),0), allergies='Aucune', antecedents='Aucun'
    )
    patients.append(patient)
print(f"✅ {len(patients)} patients créés")

print("\n🏥 Création sessions...")
services = list(Service.objects.all())
infirmiers = list(Personnel.objects.filter(poste='infirmier'))
medecins = list(Medecin.objects.all())
sessions = []
for patient in patients:
    pers_type = random.choice(['infirmier', 'medecin']) if infirmiers and medecins else 'infirmier'
    if pers_type == 'infirmier' and infirmiers:
        pers = random.choice(infirmiers)
    elif medecins:
        pers = random.choice(medecins).personnel_ptr
    else:
        pers = random.choice(personnels)
    
    session = Session.objects.create(
        id_patient=patient, id_personnel=pers,
        debut=datetime.now() - timedelta(days=random.randint(0,3), hours=random.randint(0,23)),
        service_courant=random.choice(services).nom_service,
        personnel_responsable=pers_type,
        situation_patient='en attente' if random.random()>0.3 else 'recu',
        statut='en cours'
    )
    sessions.append(session)
print(f"✅ {len(sessions)} sessions")

print("\n📝 Observations...")
obs_count = 0
for session in sessions:
    for _ in range(random.randint(1,3)):
        ObservationMedicale.objects.create(
            id_personnel=random.choice(personnels),
            observation=random.choice(OBSERVATIONS),
            date_heure=session.debut + timedelta(hours=random.randint(0,48)),
            id_session=session
        )
        obs_count += 1
print(f"✅ {obs_count} observations")

print("\n📊 RÉSUMÉ:")
print(f"Patients: {Patient.objects.count()}")
print(f"Sessions: {Session.objects.count()}")
print(f"Observations: {ObservationMedicale.objects.count()}")
for svc in services:
    inf = Session.objects.filter(service_courant=svc.nom_service, personnel_responsable='infirmier', situation_patient='en attente').count()
    med = Session.objects.filter(service_courant=svc.nom_service, personnel_responsable='medecin', situation_patient='en attente').count()
    print(f"  {svc.nom_service}: Inf={inf}, Med={med}")
print("\n✅ Terminé!\n")
