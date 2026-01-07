#!/usr/bin/env python
"""
Script pour créer un personnel pharmacien avec un email et mot de passe spécifiques.
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

def create_pharmacist():
    """Crée un personnel pharmacien avec les informations spécifiées."""
    
    email = "user@pharmacie.com"
    
    # Vérifier si l'utilisateur existe déjà
    if Personnel.objects.filter(email=email).exists():
        print(f"[!] Un personnel avec l'email {email} existe déjà.")
        personnel = Personnel.objects.get(email=email)
        print(f"    Matricule: {personnel.matricule}")
        print(f"    Nom: {personnel.nom} {personnel.prenom}")
        print(f"    Poste: {personnel.poste}")
        
        # Mettre à jour le mot de passe
        personnel.set_password('MonMot2Passe!')
        personnel.first_login_done = True
        personnel.save()
        print(f"[+] Mot de passe mis à jour pour {email}")
        return personnel
    
    # Créer le nouveau personnel
    personnel = Personnel.objects.create(
        username=email,  # Utiliser l'email comme username
        email=email,
        nom="Pharmacie",
        prenom="User",
        date_naissance="1990-01-01",
        contact="677777777",
        poste="pharmacien",
        statut="actif",
        adresse="Yaoundé, Cameroun",
        salaire=250000.00,
        first_login_done=True,  # On indique que la première connexion est faite
    )
    
    # Définir le mot de passe
    personnel.set_password('MonMot2Passe!')
    personnel.save()
    
    print(f"[+] Personnel pharmacien créé avec succès!")
    print(f"    Email: {personnel.email}")
    print(f"    Matricule: {personnel.matricule}")
    print(f"    Nom: {personnel.nom} {personnel.prenom}")
    print(f"    Poste: {personnel.poste}")
    print(f"    Mot de passe: MonMot2Passe!")
    print(f"    Statut de connexion: {personnel.statut_de_connexion}")
    
    return personnel

if __name__ == "__main__":
    try:
        create_pharmacist()
    except Exception as e:
        print(f"[-] Erreur lors de la création du personnel: {e}")
        import traceback
        traceback.print_exc()
