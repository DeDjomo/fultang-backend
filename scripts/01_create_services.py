#!/usr/bin/env python
"""
Script pour créer les services de l'hôpital.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/01_create_services.py
"""
from apps.gestion_hospitaliere.models import Service


def create_services():
    """Créer les 5 services de l'hôpital."""
    print("=" * 60)
    print("CRÉATION DES SERVICES")
    print("=" * 60)
    
    services_data = [
        {
            'nom_service': 'Chirurgie',
            'desc_service': 'Service de chirurgie générale et spécialisée. Interventions chirurgicales programmées et urgentes.'
        },
        {
            'nom_service': 'Medecine Generale',
            'desc_service': 'Service de médecine générale. Prise en charge des pathologies courantes et suivi des patients.'
        },
        {
            'nom_service': 'Pediatrie',
            'desc_service': 'Service de pédiatrie. Soins médicaux pour les enfants de 0 à 18 ans.'
        },
        {
            'nom_service': 'Urgences',
            'desc_service': 'Service des urgences médicales et chirurgicales. Prise en charge 24h/24.'
        },
        {
            'nom_service': 'Laboratoire',
            'desc_service': 'Service de laboratoire et analyses médicales. Examens biologiques et biochimiques.'
        },
    ]
    
    created_count = 0
    for data in services_data:
        service, created = Service.objects.get_or_create(
            nom_service=data['nom_service'],
            defaults={'desc_service': data['desc_service']}
        )
        if created:
            created_count += 1
            print(f"✓ Service créé: {service.nom_service}")
        else:
            print(f"○ Service existe déjà: {service.nom_service}")
    
    print("=" * 60)
    print(f"RÉSULTAT: {created_count} services créés sur {len(services_data)}")
    print("=" * 60)
    
    # Afficher tous les services
    print("\nServices actuels dans la base:")
    for s in Service.objects.all():
        print(f"  - ID {s.id}: {s.nom_service}")


create_services()
