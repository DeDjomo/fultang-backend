#!/usr/bin/env python
"""
Script pour créer les personnels directeur et pharmacien.
"""
import os
import django
import sys

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.development')
django.setup()

from apps.gestion_hospitaliere.models import Personnel
from django.utils import timezone

def create_personnel(email, nom, prenom, poste, password):
    """Crée un personnel avec les informations spécifiées."""
    
    # Vérifier si l'utilisateur existe déjà
    if Personnel.objects.filter(email=email).exists():
        print(f"[!] Un personnel avec l'email {email} existe déjà.")
        personnel = Personnel.objects.get(email=email)
        print(f"    Matricule: {personnel.matricule}")
        print(f"    Nom: {personnel.nom} {personnel.prenom}")
        print(f"    Poste: {personnel.poste}")
        
        # Mettre à jour le mot de passe
        personnel.set_password(password)
        personnel.first_login_done = True
        personnel.save()
        print(f"[+] Mot de passe mis à jour pour {email}")
        return personnel
    
    # Créer le nouveau personnel
    personnel = Personnel.objects.create(
        username=email,  # Utiliser l'email comme username
        email=email,
        nom=nom,
        prenom=prenom,
        date_naissance="1985-01-01",
        contact="677000000",
        poste=poste,
        statut="actif",
        adresse="Yaoundé, Cameroun",
        salaire=300000.00,
        first_login_done=True,
    )
    
    # Définir le mot de passe
    personnel.set_password(password)
    personnel.save()
    
    print(f"[+] Personnel créé avec succès!")
    print(f"    Email: {personnel.email}")
    print(f"    Matricule: {personnel.matricule}")
    print(f"    Nom: {personnel.nom} {personnel.prenom}")
    print(f"    Poste: {personnel.poste}")
    print(f"    Mot de passe: {password}")
    
    return personnel

if __name__ == "__main__":
    try:
        print("=" * 50)
        print("Création du Directeur")
        print("=" * 50)
        create_personnel(
            email="user@direction.com",
            nom="Directeur",
            prenom="User",
            poste="directeur",
            password="MonMot2Passe!"
        )
        
        print("\n" + "=" * 50)
        print("Création du Pharmacien")
        print("=" * 50)
        create_personnel(
            email="user@pharmacie.com",
            nom="Pharmacien",
            prenom="User",
            poste="pharmacien",
            password="MonMot2Passe!"
        )
        
        print("\n✅ Les deux personnels ont été créés avec succès!")
        
    except Exception as e:
        print(f"[-] Erreur lors de la création du personnel: {e}")
        import traceback
        traceback.print_exc()
