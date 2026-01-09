#!/usr/bin/env python
"""
Script pour créer 100 patients.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/06_create_patients.py
"""
import random
from datetime import date, timedelta
from apps.suivi_patient.models import Patient
from apps.gestion_hospitaliere.models import Personnel


PRENOMS_H = [
    "Jean", "Pierre", "Paul", "Alain", "François", "Philippe", "Emmanuel", 
    "Jacques", "Michel", "Bernard", "David", "Thomas", "Nicolas", "Olivier", 
    "Patrick", "Christian", "Éric", "Louis", "Robert", "André", "Henri",
    "Serge", "Marc", "Yves", "Guy", "Claude", "Roger", "Raymond"
]

PRENOMS_F = [
    "Marie", "Sophie", "Pauline", "Claire", "Anne", "Sylvie", "Catherine",
    "Nathalie", "Christine", "Isabelle", "Valérie", "Martine", "Monique", 
    "Jeanne", "Françoise", "Nicole", "Thérèse", "Marguerite", "Hélène",
    "Simone", "Jacqueline", "Odette", "Lucienne", "Georgette"
]

NOMS = [
    "Dupont", "Martin", "Durand", "Bernard", "Petit", "Robert", "Richard",
    "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy",
    "Girard", "Bonnet", "Mercier", "Blanc", "Guerin", "Muller", "Henry",
    "Rousseau", "Vincent", "Fournier", "Morel", "Giraud", "Andre", "Lefevre",
    "Roux", "David", "Bertrand", "Morin", "Lambert", "Mathieu", "Clement",
    "Tchouameni", "Mbappé", "Onana", "Njoya", "Nkoulou", "Eto'o", "Foe",
    "Kamga", "Ngono", "Atangana", "Biya", "Messi", "Essono", "Ekotto"
]

ADRESSES = [
    "Quartier Bastos", "Quartier Nlongkak", "Quartier Mvan", "Quartier Nkolbisson",
    "Quartier Mvog-Ada", "Quartier Mokolo", "Quartier Elig-Edzoa", "Quartier Messa",
    "Quartier Nkoldongo", "Quartier Ekounou", "Quartier Biyem-Assi", "Quartier Omnisport",
    "Rue de l'Hôpital", "Avenue Kennedy", "Boulevard du 20 Mai", "Rue Joseph Mballa"
]


def generate_phone():
    """Génère un numéro de téléphone valide (6XXXXXXXX)."""
    return f"6{random.randint(10000000, 99999999)}"


def generate_birthdate():
    """Génère une date de naissance réaliste (entre 1 et 90 ans)."""
    today = date.today()
    age = random.randint(1, 90)
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)  # On évite les problèmes de jours invalides
    return date(birth_year, birth_month, birth_day)


def create_patients():
    """Créer 100 patients avec informations valides."""
    print("=" * 60)
    print("CRÉATION DES PATIENTS")
    print("=" * 60)
    
    # Récupérer un réceptionniste pour l'enregistrement
    receptionistes = Personnel.objects.filter(poste='receptioniste')
    if not receptionistes.exists():
        print("✗ ERREUR: Aucun réceptionniste trouvé. Créez d'abord le personnel.")
        return
    
    receptioniste = receptionistes.first()
    print(f"Réceptionniste pour enregistrement: {receptioniste.nom} {receptioniste.prenom}")
    
    used_phones = set()
    used_emails = set()
    
    def get_unique_phone():
        phone = generate_phone()
        while phone in used_phones:
            phone = generate_phone()
        used_phones.add(phone)
        return phone
    
    created_count = 0
    
    for i in range(1, 101):
        # Alterner entre hommes et femmes
        is_male = i % 2 == 1
        prenom = random.choice(PRENOMS_H if is_male else PRENOMS_F)
        nom = random.choice(NOMS)
        
        # Générer email unique
        email = f"patient{i}@email.com"
        while email in used_emails:
            email = f"patient{i}_{random.randint(100, 999)}@email.com"
        used_emails.add(email)
        
        patient = Patient(
            nom=nom,
            prenom=prenom,
            date_naissance=generate_birthdate(),
            adresse=random.choice(ADRESSES),
            email=email,
            contact=get_unique_phone(),
            nom_proche=f"{random.choice(NOMS)} {random.choice(PRENOMS_H + PRENOMS_F)}",
            contact_proche=get_unique_phone(),
            id_personnel=receptioniste,
        )
        patient.save()
        created_count += 1
        
        if i % 10 == 0:
            print(f"✓ {i}/100 patients créés...")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} patients créés")
    print("=" * 60)
    
    # Afficher quelques exemples
    print("\nExemples de patients créés:")
    for p in Patient.objects.all()[:5]:
        print(f"  - {p.matricule}: {p.nom} {p.prenom}, né(e) le {p.date_naissance}")


create_patients()
