#!/usr/bin/env python
"""
Script pour changer les mots de passe de tous les personnels vers 'MonMot2Passe!'
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/13_update_passwords.py
"""
from apps.gestion_hospitaliere.models import Personnel


def update_passwords():
    """Mettre à jour les mots de passe de tous les personnels (sauf admin)."""
    print("=" * 60)
    print("MISE À JOUR DES MOTS DE PASSE")
    print("=" * 60)
    
    target_password = 'MonMot2Passe!'
    
    personnels = Personnel.objects.exclude(username='admin')
    updated_count = 0
    
    for personnel in personnels:
        personnel.set_password(target_password)
        personnel.first_login_done = True  # Marquer comme premier login fait
        personnel.save()
        updated_count += 1
        
        if updated_count % 20 == 0:
            print(f"✓ {updated_count} mots de passe mis à jour...")
    
    print(f"\n✓ {updated_count} mots de passe mis à jour au total")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: Tous les personnels ont maintenant le mot de passe '{target_password}'")
    print("=" * 60)
    
    # Afficher quelques exemples pour tester
    print("\nPour tester la connexion, utilisez:")
    for p in Personnel.objects.exclude(username='admin')[:5]:
        print(f"  - Email: {p.email} | Password: {target_password}")


update_passwords()
