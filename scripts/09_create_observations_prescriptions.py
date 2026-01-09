#!/usr/bin/env python
"""
Script pour créer les observations médicales, prescriptions et résultats.
Exécuter via: docker-compose exec -T web python manage.py shell < scripts/09_create_observations_prescriptions.py

Selon users.md: 5 observations par session, prescriptions de médicaments et d'examens par session
"""
import random
from apps.suivi_patient.models import (
    Session, ObservationMedicale, PrescriptionMedicament, 
    PrescriptionExamen, ResultatExamen
)
from apps.gestion_hospitaliere.models import Medecin, Personnel


OBSERVATIONS = [
    "Patient stable, constantes vitales normales. TA: 12/8, FC: 75 bpm, T°: 37.2°C",
    "Légère amélioration de l'état général. Diminution des douleurs.",
    "Patient conscient et orienté. Bonne réponse au traitement.",
    "Examen clinique sans particularité. Poursuite du traitement.",
    "État général satisfaisant. Pas de nouvelle plainte.",
    "Plainte de céphalées légères ce matin. Antalgiques administrés.",
    "Bon appétit, transit normal. Patient demandeur de sortie.",
    "Nuit calme, sommeil réparateur. Pas d'incident à signaler.",
    "Légère dyspnée à l'effort, surveillance rapprochée préconisée.",
    "Œdèmes des membres inférieurs en régression.",
    "Plaie chirurgicale propre, cicatrisation en bonne voie.",
    "Fièvre à 38.5°C, hémocultures prélevées. Antibiotiques débutés.",
    "Patient algique, EVA 6/10. Majoration des antalgiques.",
    "Examen neurologique normal, Glasgow 15/15.",
    "Auscultation pulmonaire claire, pas de râles.",
]

MEDICAMENTS = [
    "Paracétamol 1g - 3x/jour pendant 5 jours",
    "Amoxicilline 500mg - 2x/jour pendant 7 jours",
    "Ibuprofène 400mg - si douleur, max 3x/jour",
    "Oméprazole 20mg - 1x/jour le matin à jeun",
    "Métformine 500mg - 2x/jour avec repas",
    "Aspirine 100mg - 1x/jour (prévention cardiovasculaire)",
    "Ciprofloxacine 500mg - 2x/jour pendant 10 jours",
    "Tramadol 50mg - si douleur intense, max 4x/jour",
    "Vitamine D3 1000UI - 1x/jour",
    "Fer ferreux 100mg + Acide folique - 1x/jour",
]

EXAMENS = [
    "Numération Formule Sanguine (NFS)",
    "Glycémie à jeun",
    "Bilan hépatique complet",
    "Créatininémie + Urée",
    "Électrophorèse des protéines",
    "Radiographie thoracique",
    "Échographie abdominale",
    "Scanner cérébral",
    "IRM lombaire",
    "ECG 12 dérivations",
    "Analyse d'urines (ECBU)",
    "TSH + T3 + T4",
    "Bilan lipidique",
    "Ionogramme sanguin",
    "CRP + VS",
]

RESULTATS = [
    "Résultats dans les normes. Pas d'anomalie détectée.",
    "Légère anémie microcytaire. Supplémentation en fer recommandée.",
    "Glycémie à 1.20 g/L - Prédiabète, contrôle dans 3 mois.",
    "Bilan hépatique perturbé. Cytolyse modérée. Échographie recommandée.",
    "Créatinine normale. Fonction rénale conservée.",
    "Radiographie: pas de foyer infectieux. Parenchyme pulmonaire sain.",
    "Échographie: pas d'anomalie notable. Foie, rate, reins sans particularité.",
    "Scanner: pas de lésion visible. Pas d'effet de masse.",
    "IRM: protrusion discale L4-L5. Traitement conservateur proposé.",
    "ECG: rythme sinusal régulier. Pas de trouble du rythme.",
    "ECBU: leucocyturie significative. Antibiogramme en cours.",
    "TSH normale. Fonction thyroïdienne correcte.",
    "Cholestérol LDL élevé. Mesures hygiéno-diététiques recommandées.",
]


def create_observations_and_prescriptions():
    """Créer observations, prescriptions et résultats pour chaque session."""
    print("=" * 60)
    print("CRÉATION OBSERVATIONS, PRESCRIPTIONS ET RÉSULTATS")
    print("=" * 60)
    
    sessions = Session.objects.all()
    medecins = list(Medecin.objects.all())
    infirmiers = list(Personnel.objects.filter(poste='infirmier'))
    
    obs_count = 0
    presc_med_count = 0
    presc_exam_count = 0
    result_count = 0
    
    for session in sessions:
        # Trouver un médecin du même service
        medecins_service = [m for m in medecins if m.service and 
                           m.service.nom_service.lower() == session.service_courant.lower()]
        if not medecins_service:
            medecins_service = medecins
        
        medecin = random.choice(medecins_service)
        
        # Trouver un infirmier du même service
        infirmiers_service = [i for i in infirmiers if i.service and 
                              i.service.nom_service.lower() == session.service_courant.lower()]
        if not infirmiers_service:
            infirmiers_service = infirmiers
        
        # Créer 5 observations par session
        for _ in range(5):
            obs = ObservationMedicale(
                id_session=session,
                id_personnel=random.choice(infirmiers_service) if infirmiers_service else medecin,
                observation=random.choice(OBSERVATIONS),
            )
            obs.save()
            obs_count += 1
        
        # Créer 2-3 prescriptions de médicaments par session
        for _ in range(random.randint(2, 3)):
            presc = PrescriptionMedicament(
                id_session=session,
                id_medecin=medecin,
                liste_medicaments=random.choice(MEDICAMENTS),
                state=random.choice(['en attente', 'effectuee']),
            )
            presc.save()
            presc_med_count += 1
        
        # Créer 1-2 prescriptions d'examens par session
        num_exams = random.randint(1, 2)
        for _ in range(num_exams):
            presc_exam = PrescriptionExamen(
                id_session=session,
                id_medecin=medecin,
                nom_examen=random.choice(EXAMENS),
            )
            presc_exam.save()
            presc_exam_count += 1
            
            # Créer un résultat pour chaque prescription d'examen
            resultat = ResultatExamen(
                id_prescription=presc_exam,
                id_medecin=medecin,
                resultat=random.choice(RESULTATS),
            )
            resultat.save()
            result_count += 1
    
    print(f"\n✓ {obs_count} observations médicales créées")
    print(f"✓ {presc_med_count} prescriptions de médicaments créées")
    print(f"✓ {presc_exam_count} prescriptions d'examens créées")
    print(f"✓ {result_count} résultats d'examens créés")
    
    print("\n" + "=" * 60)
    print("CRÉATION TERMINÉE")
    print("=" * 60)


create_observations_and_prescriptions()
