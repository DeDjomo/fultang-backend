#!/usr/bin/env python
"""
Script pour créer les médecins de l'hôpital.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/03_create_medecins.py

Selon users.md: 5 médecins par service = 25 médecins au total
Email: medecin@{nom_service}{1-5}.com
"""
import random
from apps.gestion_hospitaliere.models import Medecin, Service

PRENOMS = [
    "Jean", "Pierre", "Paul", "Marie", "Sophie", "Alain", "François", "Philippe",
    "Emmanuel", "Pauline", "Claire", "Anne", "Jacques", "Michel", "Bernard",
    "David", "Thomas", "Nicolas", "Olivier", "Patrick", "Christian", "Éric",
    "Sylvie", "Catherine", "Nathalie"
]

NOMS = [
    "Dupont", "Martin", "Durand", "Bernard", "Petit", "Robert", "Richard",
    "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy",
    "Girard", "Bonnet", "Mercier", "Blanc", "Guerin", "Muller", "Henry",
    "Rousseau", "Vincent", "Fournier", "Morel"
]

# Spécialités par service
SPECIALITES = {
    'chirurgie': ['Chirurgie Générale', 'Chirurgie Orthopédique', 'Chirurgie Cardiaque', 'Neurochirurgie', 'Chirurgie Viscérale'],
    'medecinegenerale': ['Médecine Générale', 'Médecine Interne', 'Cardiologie', 'Pneumologie', 'Gastro-entérologie'],
    'pediatrie': ['Pédiatrie Générale', 'Néonatologie', 'Pédiatrie Cardio', 'Pédiatrie Neuro', 'Pédiatrie Urgences'],
    'urgences': ['Urgences Médicales', 'Urgences Traumatiques', 'Réanimation', 'SMUR', 'Urgences Pédiatriques'],
    'laboratoire': ['Biologie Médicale', 'Anatomopathologie', 'Microbiologie', 'Biochimie', 'Hématologie'],
}


def generate_phone():
    """Génère un numéro de téléphone valide (6XXXXXXXX)."""
    return f"6{random.randint(10000000, 99999999)}"


def create_medecins():
    """Créer les médecins de l'hôpital."""
    print("=" * 60)
    print("CRÉATION DES MÉDECINS")
    print("=" * 60)
    
    services = {s.nom_service.lower().replace(' ', ''): s for s in Service.objects.all()}
    
    service_email_map = {
        'chirurgie': 'chirurgie',
        'medecinegenerale': 'medecinegenerale',
        'pediatrie': 'pediatrie',
        'urgences': 'urgences',
        'laboratoire': 'laboratoire'
    }
    
    created_count = 0
    used_phones = set()
    
    def get_unique_phone():
        phone = generate_phone()
        while phone in used_phones:
            phone = generate_phone()
        used_phones.add(phone)
        return phone
    
    for service_key, service in services.items():
        email_base = service_email_map.get(service_key, service_key)
        specialites = SPECIALITES.get(service_key, ['Spécialiste'] * 5)
        
        print(f"\n--- Service: {service.nom_service} ---")
        
        for i in range(1, 6):
            email = f"medecin@{email_base}{i}.com"
            nom = random.choice(NOMS)
            prenom = random.choice(PRENOMS)
            specialite = specialites[(i - 1) % len(specialites)]
            
            medecin = Medecin(
                username=f"dr_{nom.lower()}_{email_base}{i}",
                email=email,
                nom=nom,
                prenom=prenom,
                contact=get_unique_phone(),
                service=service,
                specialite=specialite,
                statut='actif',
            )
            medecin.set_password('TempPassword123!')  # Mot de passe temporaire
            medecin.save()
            
            created_count += 1
            print(f"✓ Dr. {prenom} {nom} ({specialite}): {email}")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} médecins créés")
    print("=" * 60)
    
    # Afficher tous les médecins
    print("\nMédecins créés:")
    for m in Medecin.objects.all():
        print(f"  - ID {m.id}: Dr. {m.nom} {m.prenom} ({m.specialite}) - {m.email}")


create_medecins()
