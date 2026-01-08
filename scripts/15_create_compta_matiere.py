#!/usr/bin/env python
"""
Script pour peupler l'application comptabilite_matiere.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/15_create_compta_matiere.py
"""
import random
from decimal import Decimal
from django.utils import timezone
from apps.comptabilite_matiere.models import (
    Materiel, MaterielMedical, MaterielDurable,
    Livraison, LigneLivraison,
    Besoin, LigneBesoin,
    Sortie, LigneSortie
)
from apps.gestion_hospitaliere.models import Personnel, Service

def create_compta_matiere():
    print("=" * 60)
    print("CRÉATION COMPTABILITÉ MATIÈRE")
    print("=" * 60)

    # 1. Création des Matériels Médicaux
    print(" Création des matériels médicaux...")
    med_data = [
        ('MED-001', 'Paracétamol 500mg', 'MEDICAMENT', 'BOITE', 1500, 2500),
        ('MED-002', 'Amoxicilline 1g', 'MEDICAMENT', 'BOITE', 2000, 3500),
        ('MED-003', 'Seringue 5ml', 'CONSOMMABLE', 'UNITE', 50, 100),
        ('MED-004', 'Compresses stériles', 'CONSOMMABLE', 'SACHET', 200, 500),
        ('MED-005', 'Gants latex M', 'CONSOMMABLE', 'BOITE', 3000, 5000),
        ('MED-006', 'Réactif Hématologie', 'REACTIF', 'FLACON', 15000, 25000),
        ('MED-007', 'Bétadine Jaune', 'MEDICAMENT', 'FLACON', 1200, 2000),
        ('MED-008', 'Perfusion Salé', 'MEDICAMENT', 'POCHE', 800, 1500),
    ]

    materiels_med = []
    for code, nom, cat, unite, p_achat, p_vente in med_data:
        mat, created = MaterielMedical.objects.get_or_create(
            code_materiel=code,
            defaults={
                'nom_Materiel': nom,
                'categorie': cat,
                'unite_mesure': unite,
                'prix_achat_unitaire': Decimal(p_achat),
                'prix_vente_unitaire': Decimal(p_vente),
                'quantite_stock': 0
            }
        )
        materiels_med.append(mat)
        if created:
            print(f"  + {nom} ({cat})")

    # 2. Création des Matériels Durables
    print("\n Création des matériels durables...")
    durable_data = [
        ('DUR-001', 'Lit Hôpital Standard', 'EN_BON_ETAT', 250000),
        ('DUR-002', 'Ordinateur Bureau', 'EN_BON_ETAT', 300000),
        ('DUR-003', 'Stéthoscope', 'EN_BON_ETAT', 25000),
        ('DUR-004', 'Tensiomètre Électronique', 'EN_BON_ETAT', 45000),
        ('DUR-005', 'Chaise Bureau', 'EN_BON_ETAT', 35000),
    ]

    materiels_dur = []
    for code, nom, etat, p_achat in durable_data:
        mat, created = MaterielDurable.objects.get_or_create(
            code_materiel=code,
            defaults={
                'nom_Materiel': nom,
                'Etat': etat,  # Champ avec Majuscule
                'prix_achat_unitaire': Decimal(p_achat),
                'quantite_stock': 0,
                'localisation': 'Magasin Central'  # Typo corrigée
            }
        )
        materiels_dur.append(mat)
        if created:
            print(f"  + {nom} ({etat})")

    # 3. Création des Livraisons (Entrée de stock)
    print("\n Création des livraisons...")
    fournisseurs = ['PharmaPro', 'MedicalEquip', 'BuroTop', 'LaboSud']
    
    if not Livraison.objects.exists():
        for i in range(3):
            livraison = Livraison.objects.create(
                bon_livraison_numero=f"BL-2026-{i+1:03d}",
                nom_fournisseur=random.choice(fournisseurs),
                contact_fournisseur=f"677{random.randint(100000, 999999)}",
                date_reception=timezone.now(),
                montant_total=Decimal(0)
            )
            
            total = Decimal(0)
            
            # Ajouter des lignes médicaments
            for mat in random.sample(materiels_med, 3):
                qte = random.randint(50, 200)
                prix = mat.prix_achat_unitaire
                montant = prix * qte
                total += montant
                
                LigneLivraison.objects.create(
                    id_livraison=livraison,
                    type_materiel='MEDICAL',
                    materiel=mat,
                    code_materiel=mat.code_materiel,
                    nom_materiel=mat.nom_Materiel,
                    quantite_conforme=qte,
                    quantite_non_conforme=0,
                    prix_unitaire_achat=prix,
                    date_peremption=(timezone.now() + timezone.timedelta(days=365)).date()
                )
                
                # Mise à jour stock
                mat.quantite_stock += qte
                mat.save()

            # Ajouter des lignes durables (1 fois sur 2)
            if random.choice([True, False]):
                mat = random.choice(materiels_dur)
                qte = random.randint(1, 5)
                prix = mat.prix_achat_unitaire
                montant = prix * qte
                total += montant
                
                LigneLivraison.objects.create(
                    id_livraison=livraison,
                    type_materiel='DURABLE',
                    materiel=mat,
                    code_materiel=mat.code_materiel,
                    nom_materiel=mat.nom_Materiel,
                    quantite_conforme=qte,
                    quantite_non_conforme=0,
                    prix_unitaire_achat=prix
                )
                
                # Mise à jour stock
                mat.quantite_stock += qte
                mat.save()

            livraison.montant_total = total
            livraison.save()
            print(f"  + Livraison {livraison.bon_livraison_numero} ({total:,.0f} FCFA)")
    else:
        print("  Des livraisons existent déjà.")

    # 4. Création des Besoins
    print("\n Création des besoins...")
    users = list(Personnel.objects.filter(poste__in=['infirmier', 'medecin']))
    
    if users and not Besoin.objects.exists():
        for i in range(5):
            user = random.choice(users)
            besoin = Besoin.objects.create(
                idPersonnel_emetteur=user,
                motif=f"Besoin pour le service {user.service.nom_service if user.service else 'General'}",
                statut=random.choice(['NON_TRAITE', 'EN_COURS', 'TRAITE', 'REJETE'])
            )
            
            # Ajouter lignes
            for mat in random.sample(materiels_med, random.randint(1, 3)):
                LigneBesoin.objects.create(
                    id_besoin=besoin,
                    materiel_nom=mat.nom_Materiel,
                    quantite_demandee=random.randint(5, 50),
                    priorite=random.choice(['LOW', 'NORMAL', 'HIGH']),
                    description_justification="Stock critique"
                )
            print(f"  + Besoin #{besoin.idBesoin} par {user.nom} ({besoin.statut})")
    else:
        print("  Des besoins existent déjà ou pas de personnel.")

    # 5. Création des Sorties
    print("\n Création des sorties...")
    if not Sortie.objects.exists():
        # Sortie pour utilisation service
        user = random.choice(users) if users else Personnel.objects.first()
        if user:
            sortie = Sortie.objects.create(
                numero_sortie=f"BS-{timezone.now().year}-001",
                date_sortie=timezone.now(),
                motif_sortie='UTILISATION_SERVICE',
                idPersonnel=user,
                service_responsable=user.service.nom_service if user.service else "Hopital",
                montant_total=0
            )
            
            # Matériel qui sort
            mat = materiels_med[0]
            if mat.quantite_stock > 10:
                qte_sortie = 10
                LigneSortie.objects.create(
                    id_sortie=sortie,
                    id_materiel=mat,
                    code_materiel=mat.code_materiel,
                    nom_materiel=mat.nom_Materiel,
                    type_materiel='MEDICAL',
                    quantite=qte_sortie,
                    prix_unitaire=0, 
                    sous_total=0
                )
                mat.quantite_stock -= qte_sortie
                mat.save()
                print(f"  + Sortie {sortie.numero_sortie} (Utilisation Service)")
    else:
        print("  Des sorties existent déjà.")

    print("\n" + "=" * 60)
    print("COMPTABILITÉ MATIÈRE PEUPLÉE")
    print("=" * 60)

create_compta_matiere()
