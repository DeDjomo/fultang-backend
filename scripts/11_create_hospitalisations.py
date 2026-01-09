#!/usr/bin/env python
"""
Script pour créer les hospitalisations.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/11_create_hospitalisations.py

Selon users.md: 1 hospitalisation par session = 50 hospitalisations
"""
import random
from apps.suivi_patient.models import Session, Hospitalisation
from apps.gestion_hospitaliere.models import Medecin, Chambre, Service


def create_hospitalisations():
    """Créer une hospitalisation par session."""
    print("=" * 60)
    print("CRÉATION DES HOSPITALISATIONS")
    print("=" * 60)
    
    sessions = Session.objects.all()
    services = {s.nom_service.lower(): s for s in Service.objects.all()}
    
    created_count = 0
    skipped_count = 0
    
    for session in sessions:
        # Trouver une chambre du même service avec places disponibles
        service_name = session.service_courant.lower().replace(' ', '')
        
        # Chercher le service correspondant
        service = None
        for key, s in services.items():
            if key.replace(' ', '') == service_name:
                service = s
                break
        
        if not service:
            print(f"⚠ Service non trouvé pour session {session.id}: {session.service_courant}")
            skipped_count += 1
            continue
        
        # Chercher une chambre avec des places disponibles
        chambre = Chambre.objects.filter(service=service, nombre_places_dispo__gt=0).first()
        
        if not chambre:
            # Essayer une chambre d'un autre service
            chambre = Chambre.objects.filter(nombre_places_dispo__gt=0).first()
        
        if not chambre:
            print(f"⚠ Aucune chambre disponible pour session {session.id}")
            skipped_count += 1
            continue
        
        # Trouver un médecin du service
        medecin = Medecin.objects.filter(service=service).first()
        if not medecin:
            medecin = Medecin.objects.first()
        
        if not medecin:
            print(f"⚠ Aucun médecin trouvé pour session {session.id}")
            skipped_count += 1
            continue
        
        try:
            hospitalisation = Hospitalisation(
                id_session=session,
                id_chambre=chambre,
                id_medecin=medecin,
                statut='en cours',
            )
            hospitalisation.save()
            created_count += 1
            print(f"✓ Hospitalisation #{hospitalisation.id}: Session {session.id} → Chambre {chambre.numero_chambre}")
        except Exception as e:
            print(f"✗ Erreur session {session.id}: {e}")
            skipped_count += 1
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} hospitalisations créées, {skipped_count} ignorées")
    print("=" * 60)
    
    # Afficher l'état des chambres
    print("\nÉtat des chambres:")
    for chambre in Chambre.objects.all():
        print(f"  - {chambre.numero_chambre}: {chambre.nombre_places_dispo}/{chambre.nombre_places_total} places disponibles")


create_hospitalisations()
