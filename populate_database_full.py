"""
Script de population de la base de données avec données de test complètes.

Author: DeDjomo
Date: 2025-12-21

Usage:
    python populate_database_full.py
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Configuration Django
sys.path.append('/app')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.dev')
django.setup()

from apps.gestion_hospitaliere.models import Service, Personnel, Medecin
from apps.suivi_patient.models import (
    Patient, DossierPatient, Session, ObservationMedicale,
    PrescriptionMedicament, PrescriptionExamen, RendezVous
)

# Données de référence
FIRST_NAMES = [
    'Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Camille', 'Thomas', 'Julie',
    'Nicolas', 'Emma', 'Alexandre', 'Léa', 'Antoine', 'Chloé', 'Maxime',
    'Sarah', 'Lucas', 'Manon', 'Hugo', 'Laura', 'Gabriel', 'Pauline',
    'Arthur', 'Clara', 'Louis', 'Zoé', 'Paul', 'Alice', 'Victor', 'Inès'
]

LAST_NAMES = [
    'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
    'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel',
    'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel',
    'Girard', 'Andre', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet',
    'Francois', 'Martinez'
]

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
RHESUS_FACTORS = ['+', '-']

ALLERGIES_SAMPLES = [
    'Aucune allergie connue',
    'Allergie à la pénicilline',
    'Allergie aux arachides',
    'Allergie au pollen'
]

ANTECEDENTS_SAMPLES = [
    'Aucun antécédent particulier',
    'Diabète type 2',
    'Hypertension artérielle',
    'Asthme'
]

OBSERVATIONS_SAMPLES = [
    'Patient stable, bonne évolution',
    'Température: 37.2°C, Tension: 120/80, Pouls: 75',
    'Patient présente des douleurs abdominales',
    'Bon état général, patient coopératif',
    'Patient se plaint de maux de tête',
    'Fièvre persistante, température 38.5°C'
]

MEDICAMENTS_SAMPLES = [
    'Paracétamol 500mg - 3x/jour pendant 5 jours',
    'Amoxicilline 1g - 2x/jour pendant 7 jours',
    'Ibuprofène 400mg - 2x/jour si douleur'
]

def clear_database():
    """Efface toutes les données de test."""
    print("\n🗑️  Suppression des données existantes...")
    ObservationMedicale.objects.all().delete()
    PrescriptionMedicament.objects.all().delete()
    PrescriptionExamen.objects.all().delete()
    RendezVous.objects.all().delete()
    Session.objects.all().delete()
    DossierPatient.objects.all().delete()
    Patient.objects.all().delete()
    print("✅ Données supprimées")

def create_patients_with_dossiers(count=30):
    """Crée des patients avec leurs dossiers médicaux."""
    print(f"\n👥 Création de {count} patients avec dossiers...")
    
    # Récupérer un personnel pour id_personnel
    personnels = list(Personnel.objects.all())
    if not personnels:
        print("❌ Aucun personnel trouvé")
        return []
    
    patients = []
    
    for i in range(count):
        # Génér date naissance aléatoire
        age_years = random.randint(18, 80)
        date_naissance = datetime.now().date() - timedelta(days=age_years * 365)
        
        # Contacts uniques
        contact_num = 670000000 + i * 100 + random.randint(0, 50)
        contact_proche_num = 690000000 + i * 100 + random.randint(51, 99)
        
        patient = Patient.objects.create(
            nom=random.choice(LAST_NAMES),
            prenom=random.choice(FIRST_NAMES),
            date_naissance=date_naissance,
            contact=str(contact_num),
            contact_proche=str(contact_proche_num),
            nom_proche=f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
            adresse=f"{random.randint(1, 999)} Rue {random.choice(['de la Paix', 'des Fleurs'])}, Yaoundé",
            id_personnel=random.choice(personnels)
        )
        
        # Dossier médical
        DossierPatient.objects.create(
            id_patient=patient,
            groupe_sanguin=random.choice(BLOOD_GROUPS),
            facteur_rhesus=random.choice(RHESUS_FACTORS),
            poids=round(random.uniform(50, 100), 1),
            taille=round(random.uniform(150, 190), 0),
            allergies=random.choice(ALLERGIES_SAMPLES),
            antecedents=random.choice(ANTECEDENTS_SAMPLES)
        )
        
        patients.append(patient)
    
    print(f"✅ {len(patients)} patients créés")
    return patients

def create_sessions_for_patients(patients):
    """Crée des sessions pour les patients."""
    print("\n🏥 Création des sessions...")
    
    services = list(Service.objects.all())
    if not services:
        print("❌ Aucun service")
        return []
    
    sessions = []
    
    for patient in patients:
        service = random.choice(services)
        personnel_responsable = random.choice(['infirmier', 'medecin'])
        jours_arriere = random.randint(0, 3)
        debut = datetime.now() - timedelta(days=jours_arriere, hours=random.randint(0, 23))
        situation_patient = 'en attente' if random.random() > 0.3 else 'recu'
        
        session = Session.objects.create(
            id_patient=patient,
            debut=debut,
            service_courant=service.nom_service,
            personnel_responsable=personnel_responsable,
            situation_patient=situation_patient,
            statut='en cours'
        )
        sessions.append(session)
    
    print(f"✅ {len(sessions)} sessions créées")
    return sessions

def create_observations_for_sessions(sessions):
    """Crée des observations médicales."""
    print("\n📝 Création des observations...")
    
    personnels = list(Personnel.objects.all())
    observations_count = 0
    
    for session in sessions:
        nb_obs = random.randint(1, 3)
        
        for i in range(nb_obs):
            personnel = random.choice(personnels)
            heures_apres = random.randint(0, 48)
            date_heure = session.debut + timedelta(hours=heures_apres)
            
            ObservationMedicale.objects.create(
                id_personnel=personnel,
                observation=random.choice(OBSERVATIONS_SAMPLES),
                date_heure=date_heure,
                id_session=session
            )
            observations_count += 1
    
    print(f"✅ {observations_count} observations créées")

def display_summary():
    """Affiche un résumé."""
    print("\n" + "="*60)
    print("📊 RÉSUMÉ")
    print("="*60)
    print(f"\n👥 Patients: {Patient.objects.count()}")
    print(f"📋 Dossiers: {DossierPatient.objects.count()}")
    print(f"🏥 Sessions: {Session.objects.count()}")
    print(f"📝 Observations: {ObservationMedicale.objects.count()}")
    
    print("\n📊 DISTRIBUTION:")
    for service in Service.objects.all():
        sessions = Session.objects.filter(service_courant=service.nom_service)
        inf_att = sessions.filter(personnel_responsable='infirmier', situation_patient='en attente').count()
        med_att = sessions.filter(personnel_responsable='medecin', situation_patient='en attente').count()
        print(f"   {service.nom_service}: Inf={inf_att}, Med={med_att}")
    
    print("\n" + "="*60)

def main():
    print("\n🚀 POPULATION DE LA BASE DE DONNÉES\n")
    
    try:
        clear_database()
        patients = create_patients_with_dossiers(30)
        sessions = create_sessions_for_patients(patients)
        if sessions:
            create_observations_for_sessions(sessions)
        display_summary()
        print("\n✅ Terminé!\n")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
