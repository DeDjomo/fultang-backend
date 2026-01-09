#!/usr/bin/env python
"""
Script pour créer les chambres de l'hôpital.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/05_create_chambres.py
"""
from decimal import Decimal
from apps.gestion_hospitaliere.models import Service, Chambre


# Configuration des chambres par service
CHAMBRES_CONFIG = {
    'chirurgie': [
        {'numero': 'CHI-101', 'places': 4, 'tarif': 25000},
        {'numero': 'CHI-102', 'places': 4, 'tarif': 25000},
        {'numero': 'CHI-103', 'places': 2, 'tarif': 35000},  # Chambre semi-privée
        {'numero': 'CHI-104', 'places': 1, 'tarif': 50000},  # Chambre privée
    ],
    'medecinegenerale': [
        {'numero': 'MED-101', 'places': 4, 'tarif': 20000},
        {'numero': 'MED-102', 'places': 4, 'tarif': 20000},
        {'numero': 'MED-103', 'places': 2, 'tarif': 30000},
        {'numero': 'MED-104', 'places': 1, 'tarif': 45000},
    ],
    'pediatrie': [
        {'numero': 'PED-101', 'places': 6, 'tarif': 18000},  # Plus de places pour enfants
        {'numero': 'PED-102', 'places': 6, 'tarif': 18000},
        {'numero': 'PED-103', 'places': 4, 'tarif': 22000},
        {'numero': 'PED-104', 'places': 2, 'tarif': 35000},
    ],
    'urgences': [
        {'numero': 'URG-101', 'places': 6, 'tarif': 30000},  # Urgences = plus de lits
        {'numero': 'URG-102', 'places': 6, 'tarif': 30000},
        {'numero': 'URG-103', 'places': 4, 'tarif': 35000},
        {'numero': 'URG-104', 'places': 2, 'tarif': 50000},  # Soins intensifs
    ],
    'laboratoire': [
        # Le laboratoire n'a pas vraiment de chambres, mais ajoutons une salle d'observation
        {'numero': 'LAB-101', 'places': 3, 'tarif': 15000},
    ],
}


def create_chambres():
    """Créer les chambres de l'hôpital."""
    print("=" * 60)
    print("CRÉATION DES CHAMBRES")
    print("=" * 60)
    
    services = {s.nom_service.lower().replace(' ', ''): s for s in Service.objects.all()}
    
    created_count = 0
    total_places = 0
    
    for service_key, chambres in CHAMBRES_CONFIG.items():
        service = services.get(service_key)
        if not service:
            print(f"✗ Service non trouvé: {service_key}")
            continue
        
        print(f"\n--- {service.nom_service} ---")
        
        for chambre_data in chambres:
            chambre, created = Chambre.objects.get_or_create(
                numero_chambre=chambre_data['numero'],
                defaults={
                    'nombre_places_total': chambre_data['places'],
                    'nombre_places_dispo': chambre_data['places'],  # Toutes disponibles au départ
                    'tarif_journalier': Decimal(str(chambre_data['tarif'])),
                    'service': service,
                }
            )
            
            if created:
                created_count += 1
                total_places += chambre_data['places']
                print(f"✓ {chambre.numero_chambre}: {chambre_data['places']} places, {chambre_data['tarif']} FCFA/jour")
            else:
                print(f"○ {chambre.numero_chambre} existe déjà")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} chambres créées, {total_places} places au total")
    print("=" * 60)
    
    # Afficher le récapitulatif
    print("\nRécapitulatif par service:")
    for service in Service.objects.all():
        chambres = Chambre.objects.filter(service=service)
        places = sum(c.nombre_places_total for c in chambres)
        print(f"  - {service.nom_service}: {chambres.count()} chambres, {places} places")


create_chambres()
