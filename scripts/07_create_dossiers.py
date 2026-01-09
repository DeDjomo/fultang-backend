#!/usr/bin/env python
"""
Script pour créer les dossiers médicaux des patients.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/07_create_dossiers.py
"""
import random
from apps.suivi_patient.models import Patient, DossierPatient


GROUPES_SANGUINS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

ALLERGIES_POSSIBLES = [
    "Aucune allergie connue",
    "Pénicilline",
    "Aspirine",
    "Arachides",
    "Lactose",
    "Gluten",
    "Fruits de mer",
    "Pollen",
    "Poussière",
    "Latex",
]

ANTECEDENTS_POSSIBLES = [
    "RAS (Rien à signaler)",
    "Hypertension artérielle",
    "Diabète type 2",
    "Asthme",
    "Chirurgie appendicite 2015",
    "Fracture bras droit 2018",
    "Grossesse(s) précédente(s)",
    "Césarienne antérieure",
    "Migraine chronique",
    "Insuffisance rénale légère",
]


def create_dossiers():
    """Créer un dossier médical pour chaque patient."""
    print("=" * 60)
    print("CRÉATION DES DOSSIERS PATIENTS")
    print("=" * 60)
    
    patients = Patient.objects.all()
    created_count = 0
    
    for patient in patients:
        # Vérifier si le dossier existe déjà
        if DossierPatient.objects.filter(id_patient=patient).exists():
            continue
        
        # Générer des données médicales réalistes
        groupe = random.choice(GROUPES_SANGUINS)
        
        dossier = DossierPatient(
            id_patient=patient,
            groupe_sanguin=groupe,
            facteur_rhesus='+' if '+' in groupe else '-',
            poids=round(random.uniform(45.0, 120.0), 1),
            taille=round(random.uniform(1.50, 1.95), 2),
            allergies=random.choice(ALLERGIES_POSSIBLES),
            antecedents=random.choice(ANTECEDENTS_POSSIBLES),
        )
        dossier.save()
        created_count += 1
        
        if created_count % 20 == 0:
            print(f"✓ {created_count} dossiers créés...")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} dossiers patients créés")
    print("=" * 60)
    
    # Afficher quelques exemples
    print("\nExemples de dossiers:")
    for d in DossierPatient.objects.all()[:5]:
        print(f"  - {d.id_patient.matricule}: {d.groupe_sanguin}, {d.poids}kg, {d.taille}m")


create_dossiers()
