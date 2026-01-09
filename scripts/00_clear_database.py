#!/usr/bin/env python
"""
Script pour vider la base de données.
Exécuter via: python manage.py shell < scripts/00_clear_database.py
ou: docker-compose exec web python manage.py shell < scripts/00_clear_database.py
"""
from apps.comptabilite_financiere.models import Quittance
from apps.comptabilite_matiere.models import (
    PieceJointeRapport, Rapport, LigneArchiveInventaire, ArchiveInventaire,
    LigneSortie, Sortie, LigneLivraison, Livraison, LigneBesoin, Besoin,
    MaterielDurable, MaterielMedical, Materiel
)
from apps.suivi_patient.models import (
    ResultatExamen, PrescriptionExamen, PrescriptionMedicament,
    ObservationMedicale, Hospitalisation, RendezVous, Session,
    DossierPatient, Patient
)
from apps.gestion_hospitaliere.models import Chambre, Medecin, Personnel, Service


def clear_database():
    """Vider la base de données dans l'ordre inverse des dépendances."""
    print("=" * 60)
    print("VIDAGE DE LA BASE DE DONNÉES")
    print("=" * 60)
    
    tables = [
        # Comptabilité financière
        ("Quittance", Quittance),
        
        # Comptabilité matière (ordre inverse des dépendances)
        ("PieceJointeRapport", PieceJointeRapport),
        ("Rapport", Rapport),
        ("LigneArchiveInventaire", LigneArchiveInventaire),
        ("ArchiveInventaire", ArchiveInventaire),
        ("LigneSortie", LigneSortie),
        ("Sortie", Sortie),
        ("LigneLivraison", LigneLivraison),
        ("Livraison", Livraison),
        ("LigneBesoin", LigneBesoin),
        ("Besoin", Besoin),
        ("MaterielDurable", MaterielDurable),
        ("MaterielMedical", MaterielMedical),
        ("Materiel", Materiel),
        
        # Suivi patient
        ("ResultatExamen", ResultatExamen),
        ("PrescriptionExamen", PrescriptionExamen),
        ("PrescriptionMedicament", PrescriptionMedicament),
        ("ObservationMedicale", ObservationMedicale),
        ("Hospitalisation", Hospitalisation),
        ("RendezVous", RendezVous),
        ("Session", Session),
        ("DossierPatient", DossierPatient),
        ("Patient", Patient),
        
        # Gestion hospitalière
        ("Chambre", Chambre),
        ("Medecin", Medecin),
        ("Personnel (sauf admin)", None),  # Special case
        ("Service", Service),
    ]
    
    for table_name, model in tables:
        try:
            if table_name == "Personnel (sauf admin)":
                # Garder l'utilisateur admin
                count = Personnel.objects.exclude(username='admin').count()
                Personnel.objects.exclude(username='admin').delete()
                print(f"✓ {table_name}: {count} enregistrements supprimés")
            else:
                count = model.objects.count()
                model.objects.all().delete()
                print(f"✓ {table_name}: {count} enregistrements supprimés")
        except Exception as e:
            print(f"✗ {table_name}: ERREUR - {str(e)}")
    
    print("=" * 60)
    print("BASE DE DONNÉES VIDÉE")
    print("=" * 60)


clear_database()
