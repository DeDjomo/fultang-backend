#!/usr/bin/env python
"""
Script pour peupler l'application comptabilite_financiere.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/14_create_compta_financiere.py
"""
import random
from decimal import Decimal
from django.utils import timezone
from apps.comptabilite_financiere.models import (
    CompteComptable, Journal, EcritureComptable, LigneEcriture, PrestationDeService
)
from apps.gestion_hospitaliere.models import Service, Personnel

def create_compta_financiere():
    print("=" * 60)
    print("CRÉATION COMPTABILITÉ FINANCIÈRE")
    print("=" * 60)

    # 1. Création du Plan Comptable (Extrait OHADA)
    comptes_data = [
        # Classe 1: Capitaux
        ('101000', 'Capital Social', '1', 'passif', None),
        # Classe 2: Immobilisations
        ('211000', 'Terrains', '2', 'actif', None),
        ('231000', 'Bâtiments', '2', 'actif', None),
        # Classe 4: Tiers
        ('401100', 'Fournisseurs', '4', 'passif', None),
        ('411100', 'Clients', '4', 'actif', None),
        # Classe 5: Trésorerie
        ('521000', 'Banque locale', '5', 'tresorerie', None),
        ('571000', 'Caisse principale', '5', 'tresorerie', None),
        ('571100', 'Caisse pharmacie', '5', 'tresorerie', '571000'),
        ('571200', 'Caisse réception', '5', 'tresorerie', '571000'),
        # Classe 6: Charges
        ('601000', 'Achats de marchandises', '6', 'charge', None),
        ('605000', 'Achats de fournitures médicales', '6', 'charge', None),
        # Classe 7: Produits
        ('701000', 'Ventes de marchandises', '7', 'produit', None),
        ('706000', 'Services vendus', '7', 'produit', None),
        ('706100', 'Consultations', '7', 'produit', '706000'),
        ('706200', 'Examens Laboratoire', '7', 'produit', '706000'),
        ('706300', 'Hospitalisations', '7', 'produit', '706000'),
    ]

    print(" Création des comptes comptables...")
    comptes_obj = {}
    
    # Créer d'abord les comptes sans parents
    for num, lib, classe, type_cpte, parent_num in comptes_data:
        if not parent_num:
            compte, created = CompteComptable.objects.get_or_create(
                numero_compte=num,
                defaults={
                    'libelle': lib,
                    'classe': classe,
                    'type_compte': type_cpte
                }
            )
            comptes_obj[num] = compte
            if created:
                print(f"  + Compte {num} - {lib}")

    # Créer les comptes avec parents
    for num, lib, classe, type_cpte, parent_num in comptes_data:
        if parent_num:
            parent = comptes_obj.get(parent_num)
            if parent:
                compte, created = CompteComptable.objects.get_or_create(
                    numero_compte=num,
                    defaults={
                        'libelle': lib,
                        'classe': classe,
                        'type_compte': type_cpte,
                        'compte_parent': parent
                    }
                )
                comptes_obj[num] = compte
                if created:
                    print(f"  + Compte {num} - {lib} (Parent: {parent_num})")

    # 2. Création des Journaux
    journaux_data = [
        ('JC', 'Journal de Caisse', '571000'),
        ('JB', 'Journal de Banque', '521000'),
        ('JOD', 'Journal des Opérations Diverses', None),
    ]

    print("\n Création des journaux...")
    journaux_obj = {}
    for code, lib, compte_defaut_num in journaux_data:
        compte = comptes_obj.get(compte_defaut_num) if compte_defaut_num else None
        journal, created = Journal.objects.get_or_create(
            code=code,
            defaults={
                'libelle': lib,
                'compte_contrepartie': compte,
                'actif': True
            }
        )
        journaux_obj[code] = journal
        if created:
            print(f"  + Journal {code} - {lib}")

    # 3. Création des Prestations de Service
    print("\n Création des prestations de service...")
    services = Service.objects.all()
    compte_consult = comptes_obj.get('706100') # Consultations
    
    if compte_consult and services.exists():
        count = 0
        for i, service in enumerate(services):
            # Code comptable fictif mais unique pour chaque service
            code_prestation = 706100 + i + 1
            
            # Vérifier si existe déjà
            if not PrestationDeService.objects.filter(code_comptable=code_prestation, service_rendu=service).exists():
                PrestationDeService.objects.create(
                    code_comptable=code_prestation,
                    service_rendu=service
                )
                print(f"  + Prestation {code_prestation} pour {service.nom_service}")
                count += 1
        print(f"  {count} prestations créées.")

    # 4. Création d'Écritures Comptables
    print("\n Création d'écritures comptables (exemple)...")
    
    # 4.1 Dotation Initiale Caisse (Banque -> Caisse)
    journal_caisse = journaux_obj.get('JC')
    compte_caisse = comptes_obj.get('571000')
    compte_banque = comptes_obj.get('521000')
    comptable = Personnel.objects.filter(poste='comptable').first()

    if journal_caisse and compte_caisse and compte_banque and comptable:
        # Vérifier si écriture existe déjà pour éviter doublons
        if not EcritureComptable.objects.filter(libelle="Dotation initiale caisse").exists():
            ecriture = EcritureComptable.objects.create(
                numero_ecriture=EcritureComptable.generer_numero_ecriture(),
                date_ecriture=timezone.now().date(),
                journal=journal_caisse,
                libelle="Dotation initiale caisse",
                statut='validee',
                comptable=comptable
            )
            
            # Débit Caisse
            LigneEcriture.objects.create(
                ecriture=ecriture,
                compte=compte_caisse,
                libelle="Approvisionnement caisse",
                montant_debit=Decimal('500000.00'),
                montant_credit=Decimal('0.00'),
                ordre=1
            )
            
            # Crédit Banque (Virement interne)
            LigneEcriture.objects.create(
                ecriture=ecriture,
                compte=compte_banque,
                libelle="Retrait banque",
                montant_debit=Decimal('0.00'),
                montant_credit=Decimal('500000.00'),
                ordre=2
            )
            print(f"  + Écriture {ecriture.numero_ecriture}: Dotation initiale caisse (500,000 FCFA)")

    print("\n" + "=" * 60)
    print("COMPTABILITÉ FINANCIÈRE PEUPLÉE")
    print("=" * 60)

create_compta_financiere()
