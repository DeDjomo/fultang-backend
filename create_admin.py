"""
Script pour créer ou vérifier l'administrateur système.

Usage:
    python create_admin.py
"""
from django.contrib.auth.hashers import make_password
import os
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.development')
django.setup()

from apps.gestion_hospitaliere.models import Admin


def create_or_update_admin():
    """Crée ou met à jour l'administrateur système."""
    
    print("=" * 60)
    print("GESTION DE L'ADMINISTRATEUR SYSTÈME")
    print("=" * 60)
    
    # Vérifier si un admin existe
    admin = Admin.objects.first()
    
    if admin:
        print(f"\n✓ Un administrateur existe déjà:")
        print(f"  Login: {admin.login}")
        print(f"  ID: {admin.id}")
        
        choice = input("\nQue voulez-vous faire?\n1. Changer le mot de passe\n2. Afficher les informations\n3. Quitter\nChoix (1/2/3): ")
        
        if choice == "1":
            new_password = input("\nEntrez le nouveau mot de passe: ")
            confirm_password = input("Confirmez le mot de passe: ")
            
            if new_password != confirm_password:
                print("\n❌ Les mots de passe ne correspondent pas!")
                return
            
            admin.password = make_password(new_password)
            admin.save()
            print(f"\n✓ Mot de passe mis à jour avec succès pour '{admin.login}'!")
            print(f"\nVous pouvez maintenant vous connecter avec:")
            print(f"  Username: {admin.login}")
            print(f"  Password: {new_password}")
            
        elif choice == "2":
            print(f"\n✓ Informations de l'administrateur:")
            print(f"  Login: {admin.login}")
            print(f"  ID: {admin.id}")
            print(f"  Password (hashé): {admin.password[:50]}...")
            
    else:
        print("\n⚠ Aucun administrateur n'existe dans le système.")
        create = input("Voulez-vous créer un administrateur? (o/n): ")
        
        if create.lower() == 'o':
            login = input("\nEntrez le login de l'administrateur: ")
            password = input("Entrez le mot de passe: ")
            confirm_password = input("Confirmez le mot de passe: ")
            
            if password != confirm_password:
                print("\n❌ Les mots de passe ne correspondent pas!")
                return
            
            admin = Admin.objects.create(
                login=login,
                password=make_password(password)
            )
            
            print(f"\n✓ Administrateur créé avec succès!")
            print(f"\nVous pouvez maintenant vous connecter avec:")
            print(f"  Username: {login}")
            print(f"  Password: {password}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    try:
        create_or_update_admin()
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        import traceback
        traceback.print_exc()
