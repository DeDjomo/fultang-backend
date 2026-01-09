#!/usr/bin/env python
"""
Script pour créer les quittances.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/12_create_quittances.py

Selon users.md: 3 quittances par session = 150 quittances
"""
import random
from decimal import Decimal
from django.utils import timezone
from apps.suivi_patient.models import Session
from apps.comptabilite_financiere.models import Quittance
from apps.gestion_hospitaliere.models import Personnel


MOTIFS = [
    "Frais de consultation médicale",
    "Frais d'hospitalisation - Jour 1",
    "Frais d'hospitalisation - Jour 2",
    "Frais d'hospitalisation - Jour 3",
    "Achat de médicaments",
    "Frais d'examens de laboratoire",
    "Frais de radiologie",
    "Frais d'échographie",
    "Frais de chirurgie",
    "Frais de soins infirmiers",
]

TYPE_RECETTES = ['consultation', 'hospitalisation', 'pharmacie', 'laboratoire', 'soins']
MODES_PAIEMENT = ['especes', 'mobile_money', 'carte', 'virement']


def create_quittances():
    """Créer 3 quittances par session."""
    print("=" * 60)
    print("CRÉATION DES QUITTANCES")
    print("=" * 60)
    
    sessions = Session.objects.all()
    caissiers = list(Personnel.objects.filter(poste='caissier'))
    
    if not caissiers:
        print("✗ ERREUR: Aucun caissier trouvé")
        return
    
    created_count = 0
    now = timezone.now()
    
    for session in sessions:
        for i in range(3):
            # Montant aléatoire entre 5000 et 150000 FCFA
            montant = Decimal(str(random.randint(5, 150) * 1000))
            
            # Date de paiement: moments différents pendant la session
            date_paiement = now - timezone.timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))
            
            quittance = Quittance(
                date_paiement=date_paiement,
                Montant_paye=montant,
                Motif=random.choice(MOTIFS),
                type_recette=random.choice(TYPE_RECETTES),
                mode_paiement=random.choice(MODES_PAIEMENT),
                id_session=session,
                caissier=random.choice(caissiers),
                validee=random.choice([True, False, True]),  # 2/3 validées
            )
            quittance.save()
            created_count += 1
        
        if created_count % 30 == 0:
            print(f"✓ {created_count} quittances créées...")
    
    print(f"✓ {created_count} quittances créées au total")
    
    print("\n" + "=" * 60)
    print(f"RÉSULTAT: {created_count} quittances créées")
    print("=" * 60)
    
    # Statistiques
    total = Quittance.objects.count()
    validees = Quittance.objects.filter(validee=True).count()
    montant_total = sum(q.Montant_paye for q in Quittance.objects.all())
    
    print(f"\nStatistiques:")
    print(f"  - Total: {total} quittances")
    print(f"  - Validées: {validees}")
    print(f"  - Montant total: {montant_total:,.0f} FCFA")


create_quittances()
