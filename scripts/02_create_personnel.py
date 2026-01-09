#!/usr/bin/env python
"""
Script pour créer le personnel de l'hôpital (hors médecins).
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/02_create_personnel.py

Selon users.md:
- 5 Comptables: comptable@matiere{1-5}.com
- 1 Directeur: user@direction.com
- 5 Pharmaciens: user@pharmacie{1-5}.com
- 5 Caissiers: user@caisse{1-5}.com
- 5 Réceptionnistes: user@reception{1-5}.com
- 5x5 Infirmiers: infirmier@{service}{1-5}.com (25 total)
- 5x5 Laborantins: laborantin@{service}{1-5}.com (25 total)
"""
import random
from django.contrib.auth.hashers import make_password
from apps.gestion_hospitaliere.models import Personnel, Service

# Liste de prénoms et noms pour générer des données réalistes
PRENOMS = [
    "Jean", "Pierre", "Paul", "Marie", "Sophie", "Alain", "François", "Philippe",
    "Emmanuel", "Pauline", "Claire", "Anne", "Jacques", "Michel", "Bernard",
    "David", "Thomas", "Nicolas", "Olivier", "Patrick", "Christian", "Éric",
    "Sylvie", "Catherine", "Nathalie", "Christine", "Isabelle", "Valérie",
    "Martine", "Monique", "Jeanne", "Françoise", "Louis", "Robert", "André"
]

NOMS = [
    "Dupont", "Martin", "Durand", "Bernard", "Petit", "Robert", "Richard",
    "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy",
    "Girard", "Bonnet", "Mercier", "Blanc", "Guerin", "Muller", "Henry",
    "Rousseau", "Vincent", "Fournier", "Morel", "Giraud", "Andre", "Lefevre",
    "Roux", "David", "Bertrand", "Morin", "Lambert", "Mathieu", "Clement"
]


def generate_phone():
    """Génère un numéro de téléphone valide (6XXXXXXXX)."""
    return f"6{random.randint(10000000, 99999999)}"


def create_personnel():
    """Créer le personnel de l'hôpital."""
    print("=" * 60)
    print("CRÉATION DU PERSONNEL")
    print("=" * 60)
    
    # Récupérer les services
    services = {s.nom_service.lower().replace(' ', ''): s for s in Service.objects.all()}
    service_names = list(services.keys())
    
    print(f"Services trouvés: {list(services.keys())}")
    
    # Mapping des noms de services pour les emails
    service_email_map = {
        'chirurgie': 'chirurgie',
        'medecinegenerale': 'medecinegenerale',
        'pediatrie': 'pediatrie',
        'urgences': 'urgences',
        'laboratoire': 'laboratoire'
    }
    
    created_personnel = []
    used_phones = set()
    
    def get_unique_phone():
        """Génère un numéro de téléphone unique."""
        phone = generate_phone()
        while phone in used_phones:
            phone = generate_phone()
        used_phones.add(phone)
        return phone
    
    def create_one_personnel(email, poste, service=None, nom=None, prenom=None):
        """Crée un personnel avec les informations données."""
        nom = nom or random.choice(NOMS)
        prenom = prenom or random.choice(PRENOMS)
        
        personnel = Personnel(
            username=email.split('@')[0] + '_' + email.split('@')[1].split('.')[0],
            email=email,
            nom=nom,
            prenom=prenom,
            contact=get_unique_phone(),
            poste=poste,
            service=service,
            statut='actif',
        )
        # Le mot de passe sera auto-généré par le signal/save
        personnel.set_password('TempPassword123!')  # Mot de passe temporaire
        personnel.save()
        return personnel
    
    # 1. Créer les comptables (5)
    print("\n--- Comptables ---")
    for i in range(1, 6):
        email = f"comptable@matiere{i}.com"
        p = create_one_personnel(email, 'comptable_matiere')
        created_personnel.append(p)
        print(f"✓ Comptable créé: {email}")
    
    # 2. Créer le directeur (1)
    print("\n--- Directeur ---")
    email = "user@direction.com"
    p = create_one_personnel(email, 'directeur', nom="Kamga", prenom="Emmanuel")
    created_personnel.append(p)
    print(f"✓ Directeur créé: {email}")
    
    # 3. Créer les pharmaciens (5)
    print("\n--- Pharmaciens ---")
    for i in range(1, 6):
        email = f"user@pharmacie{i}.com"
        p = create_one_personnel(email, 'pharmacien')
        created_personnel.append(p)
        print(f"✓ Pharmacien créé: {email}")
    
    # 4. Créer les caissiers (5)
    print("\n--- Caissiers ---")
    for i in range(1, 6):
        email = f"user@caisse{i}.com"
        p = create_one_personnel(email, 'caissier')
        created_personnel.append(p)
        print(f"✓ Caissier créé: {email}")
    
    # 5. Créer les réceptionnistes (5)
    print("\n--- Réceptionnistes ---")
    for i in range(1, 6):
        email = f"user@reception{i}.com"
        p = create_one_personnel(email, 'receptioniste')
        created_personnel.append(p)
        print(f"✓ Réceptionniste créé: {email}")
    
    # 6. Créer les infirmiers (5 par service = 25)
    print("\n--- Infirmiers (5 par service) ---")
    for service_key, service in services.items():
        email_base = service_email_map.get(service_key, service_key)
        for i in range(1, 6):
            email = f"infirmier@{email_base}{i}.com"
            p = create_one_personnel(email, 'infirmier', service)
            created_personnel.append(p)
            print(f"✓ Infirmier créé: {email} ({service.nom_service})")
    
    # 7. Créer les laborantins (5 par service = 25)
    print("\n--- Laborantins (5 par service) ---")
    for service_key, service in services.items():
        email_base = service_email_map.get(service_key, service_key)
        for i in range(1, 6):
            email = f"laborantin@{email_base}{i}.com"
            p = create_one_personnel(email, 'laborantin', service)
            created_personnel.append(p)
            print(f"✓ Laborantin créé: {email} ({service.nom_service})")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {len(created_personnel)} personnels créés")
    print("=" * 60)
    
    # Résumé par poste
    print("\nRésumé par poste:")
    postes_count = {}
    for p in Personnel.objects.exclude(username='admin'):
        postes_count[p.poste] = postes_count.get(p.poste, 0) + 1
    for poste, count in sorted(postes_count.items()):
        print(f"  - {poste}: {count}")


create_personnel()
