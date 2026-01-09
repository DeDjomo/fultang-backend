#!/usr/bin/env python
"""
Script pour créer les rendez-vous.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/10_create_rendez_vous.py

Selon users.md: 5 rendez-vous par médecin = 125 rendez-vous
"""
import random
from datetime import datetime, timedelta
from django.utils import timezone
from apps.suivi_patient.models import Patient, RendezVous
from apps.gestion_hospitaliere.models import Medecin


MOTIFS = [
    "Consultation de suivi",
    "Contrôle post-opératoire",
    "Renouvellement d'ordonnance",
    "Consultation spécialisée",
    "Deuxième avis médical",
    "Suivi maladie chronique",
    "Bilan de santé annuel",
    "Consultation pré-opératoire",
    "Résultats d'examens",
    "Douleurs abdominales",
    "Céphalées récurrentes",
    "Problèmes respiratoires",
    "Douleurs articulaires",
    "Fatigue chronique",
]


def create_rendez_vous():
    """Créer 5 rendez-vous par médecin."""
    print("=" * 60)
    print("CRÉATION DES RENDEZ-VOUS")
    print("=" * 60)
    
    medecins = Medecin.objects.all()
    patients = list(Patient.objects.all())
    
    if len(patients) < 125:
        print(f"Note: {len(patients)} patients disponibles pour 125 RDV (certains auront plusieurs RDV)")
    
    created_count = 0
    now = timezone.now()
    
    for medecin in medecins:
        print(f"\n--- Dr. {medecin.nom} {medecin.prenom} ({medecin.specialite}) ---")
        
        for i in range(5):
            # RDV dans les prochains 30 jours
            rdv_date = now + timedelta(days=random.randint(1, 30), hours=random.randint(8, 17))
            
            patient = random.choice(patients)
            
            rdv = RendezVous(
                date_heure=rdv_date,
                id_medecin=medecin,
                id_patient=patient,
                statut='en_attente',
                motif=random.choice(MOTIFS),
            )
            rdv.save()
            created_count += 1
            print(f"  ✓ RDV #{rdv.id}: {patient.nom} {patient.prenom} le {rdv_date.strftime('%d/%m/%Y %H:%M')}")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} rendez-vous créés")
    print("=" * 60)


create_rendez_vous()
