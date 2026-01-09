#!/usr/bin/env python
"""
Script pour créer les sessions de suivi patient.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/08_create_sessions.py

Selon users.md: 10 sessions par service (patients différents) avec statut 'en cours'
"""
import random
from apps.suivi_patient.models import Patient, Session
from apps.gestion_hospitaliere.models import Service, Personnel


def create_sessions():
    """Créer 10 sessions par service (50 au total)."""
    print("=" * 60)
    print("CRÉATION DES SESSIONS")
    print("=" * 60)
    
    services = Service.objects.all()
    patients = list(Patient.objects.all())
    
    if len(patients) < 50:
        print(f"✗ ERREUR: Pas assez de patients ({len(patients)}). Minimum 50 requis.")
        return
    
    # Mélanger les patients pour les distribuer aléatoirement
    random.shuffle(patients)
    
    # Récupérer un réceptionniste pour créer les sessions
    receptioniste = Personnel.objects.filter(poste='receptioniste').first()
    
    if not receptioniste:
        print("✗ ERREUR: Aucun réceptionniste trouvé.")
        return
    
    created_count = 0
    patient_index = 0
    
    for service in services:
        print(f"\n--- Service: {service.nom_service} ---")
        
        for i in range(10):
            if patient_index >= len(patients):
                print("✗ Plus de patients disponibles")
                break
            
            patient = patients[patient_index]
            patient_index += 1
            
            session = Session(
                id_patient=patient,
                id_personnel=receptioniste,  # Créé par le réceptionniste
                service_courant=service.nom_service,
                # personnel_responsable doit être un POSTE (infirmier, medecin) pas un matricule
                # Selon description.md ligne 59 et 163
                personnel_responsable='infirmier',  # Par défaut vers l'infirmier
                statut='en cours',
                situation_patient='en attente',
            )
            session.save()
            created_count += 1
            print(f"✓ Session #{session.id}: {patient.nom} {patient.prenom}")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} sessions créées")
    print("=" * 60)
    
    # Récapitulatif
    print("\nRécapitulatif par service:")
    for service in services:
        count = Session.objects.filter(service_courant=service.nom_service).count()
        print(f"  - {service.nom_service}: {count} sessions")


create_sessions()
