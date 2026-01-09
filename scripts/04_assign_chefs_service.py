#!/usr/bin/env python
"""
Script pour assigner les chefs de service.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/04_assign_chefs_service.py
"""
from apps.gestion_hospitaliere.models import Service, Medecin


def assign_chefs():
    """Assigner un médecin comme chef pour chaque service."""
    print("=" * 60)
    print("ASSIGNATION DES CHEFS DE SERVICE")
    print("=" * 60)
    
    for service in Service.objects.all():
        # Trouver le premier médecin du service (généralement le plus ancien/senior)
        medecin = Medecin.objects.filter(service=service).first()
        
        if medecin:
            service.chef_service = medecin
            service.save()
            print(f"✓ {service.nom_service}: Dr. {medecin.prenom} {medecin.nom}")
        else:
            print(f"✗ {service.nom_service}: Aucun médecin trouvé")
    
    print("\n" + "=" * 60)
    print("ASSIGNATION TERMINÉE")
    print("=" * 60)
    
    # Afficher les services avec leurs chefs
    print("\nServices et leurs chefs:")
    for s in Service.objects.all():
        chef = f"Dr. {s.chef_service.prenom} {s.chef_service.nom}" if s.chef_service else "Non assigné"
        print(f"  - {s.nom_service}: {chef}")


assign_chefs()
