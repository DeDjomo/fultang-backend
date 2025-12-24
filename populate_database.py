"""
Script de population de la base de données avec données de test variées.

Author: Assistant AI
Date: 2025-12-20
Description: Peuple toutes les tables sauf Personnel et Services avec des données
             de test diversifiées et réalistes.
"""
import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.development')
django.setup()

from apps.gestion_hospitaliere.models import Service, Personnel, Medecin, Chambre
from apps.suivi_patient.models import (
    Patient, Session, ObservationMedicale, PrescriptionMedicament,
    PrescriptionExamen, ResultatExamen, Hospitalisation, RendezVous,
    DossierPatient
)
from django.utils import timezone


def clear_all_data():
    """Supprime toutes les données sauf Personnel et Services."""
    print("\n🗑️  Nettoyage des données existantes...")
    
    # Ordre important pour respecter les contraintes FK
    ResultatExamen.objects.all().delete()
    PrescriptionExamen.objects.all().delete()
    PrescriptionMedicament.objects.all().delete()
    ObservationMedicale.objects.all().delete()
    Hospitalisation.objects.all().delete()
    RendezVous.objects.all().delete()
    DossierPatient.objects.all().delete()
    Session.objects.all().delete()
    Chambre.objects.all().delete()
    Patient.objects.all().delete()
    
    print("✅ Nettoyage terminé!\n")


def create_patients():
    """Crée 30 patients variés."""
    print("👥 Création des patients...")
    
    noms = [
        "Nkwain", "Mbarga", "Atangana", "Kamga", "Nguema", "Fotso",
        "Biya", "Milla", "Eto'o", "Abega", "Omam-Biyick", "Nkono",
        "Song", "Ndip", "Foe", "Tchami", "Djoumessi", "Ngatcha",
        "Moukoko", "Ebelle", "Tchatchoua", "Matip", "Bassong", "Geremi",
        "Webó", "Ekeng", "Onguéné", "Choupo-Moting", "Toko", "Ngadeu"
    ]
    
    prenoms = [
        "Paul", "Roger", "Samuel", "François", "Jean", "Marie",
        "Sophie", "Claudine", "Jeanne", "Célestine", "Berthe", "Honoré",
        "Emmanuel", "Christian", "Alain", "Vincent", "Joseph", "André",
        "Pierre", "Jacques", "Thérèse", "Brigitte", "Martine", "Élise",
        "Nadège", "Vanessa", "Patrick", "Richard", "Martin", "Bernard"
    ]
    
    adresses = [
        "Bastos, Yaoundé", "Mendong, Yaoundé", "Essos, Yaoundé", "Mvan, Yaoundé",
        "Bonanjo, Douala", "Akwa, Douala", "Bonapriso, Douala", "Deido, Douala",
        "Centre-ville, Bafoussam", "Lycée, Dschang", "Université, Ngaoundéré",
        "Plateau, Garoua", "Administratif, Maroua", "Downtown, Bamenda"
    ]
    
    receptionistes = list(Personnel.objects.filter(poste='receptioniste')[:5])
    
    patients = []
    year = datetime.now().year
    
    for i in range(30):
        nom = random.choice(noms)
        prenom = random.choice(prenoms)
        age = random.randint(1, 85)
        date_naissance = datetime.now().date() - timedelta(days=age*365 + random.randint(0, 365))
        
        # Contact et proche
        contact = f"6{random.choice(['5','7','8','9'])}{random.randint(1000000, 9999999)}"
        contact_proche = f"6{random.choice(['5','7','8','9'])}{random.randint(1000000, 9999999)}"
        
        patient = Patient.objects.create(
            nom=nom,
            prenom=prenom,
            date_naissance=date_naissance,
            adresse=random.choice(adresses),
            email=f"{prenom.lower()}.{nom.lower()}{random.randint(100, 999)}@email.cm" if random.random() > 0.3 else None,
            contact=contact,
            nom_proche=f"{random.choice(prenoms)} {random.choice(noms)}",
            contact_proche=contact_proche,
            matricule=f"{year % 100}PAT{str(i+2).zfill(5)}",
            id_personnel=random.choice(receptionistes)
        )
        patients.append(patient)
    
    print(f"✅ {len(patients)} patients créés!")
    return patients


def create_chambres():
    """Crée 20 chambres variées."""
    print("🛏️  Création des chambres...")
    
    chambres = []
    tarifs = [5000, 7500, 10000, 15000, 20000, 25000, 30000]
    
    for i in range(20):
        numero = f"{random.choice(['A','B','C','D'])}{str(i+1).zfill(2)}"
        nb_places = random.choice([1, 2, 3, 4])
        tarif = random.choice(tarifs)
        
        chambre = Chambre.objects.create(
            numero_chambre=numero,
            nombre_places_total=nb_places,
            nombre_places_dispo=nb_places,  # Toutes disponibles au début
            tarif_journalier=Decimal(str(tarif))
        )
        chambres.append(chambre)
    
    print(f"✅ {len(chambres)} chambres créées!")
    return chambres


def create_sessions(patients):
    """Crée des sessions variées pour tous les services."""
    print("📋 Création des sessions...")
    
    services = list(Service.objects.all())
    personnel_list = list(Personnel.objects.filter(statut='actif'))
    
    statuts = ['en attente', 'en cours', 'terminee']
    situations = ['en attente', 'recu']
    postes_responsables = ['infirmier', 'medecin', 'laborantin']
    
    sessions = []
    
    # Créer au moins 5-8 sessions par service
    for service in services:
        nb_sessions = random.randint(5, 8)
        
        for _ in range(nb_sessions):
            patient = random.choice(patients)
            personnel = random.choice(personnel_list)
            
            # Dates variées (derniers 30 jours)
            jours_passes = random.randint(0, 30)
            debut = timezone.now() - timedelta(days=jours_passes, hours=random.randint(0, 23))
            
            statut = random.choice(statuts)
            
            # Si terminée, ajouter une date de fin
            fin = None
            if statut == 'terminee':
                fin = debut + timedelta(hours=random.randint(1, 48))
            
            # Situation patient selon statut
            if statut == 'terminee':
                situation = 'recu'
            else:
                situation = random.choice(situations)
            
            session = Session.objects.create(
                id_patient=patient,
                id_personnel=personnel,
                service_courant=service.nom_service,
                personnel_responsable=random.choice(postes_responsables),
                statut=statut,
                situation_patient=situation,
                debut=debut,
                fin=fin
            )
            sessions.append(session)
    
    print(f"✅ {len(sessions)} sessions créées!")
    return sessions


def create_observations(sessions):
    """Crée des observations médicales pour les sessions."""
    print("📝 Création des observations médicales...")
    
    infirmiers = list(Personnel.objects.filter(poste='infirmier'))
    medecins = list(Medecin.objects.all())
    personnel_medical = infirmiers + medecins
    
    observations_templates = [
        "Température: {temp}°C, Tension: {tension}, Pouls: {pouls} bpm. Patient {etat}.",
        "Examen clinique: {symptome}. Constantes: TA {tension}, FC {pouls}, T° {temp}°C.",
        "Patient se plaint de {symptome}. Température: {temp}°C. État général {etat}.",
        "Consultation: {symptome}. Constantes vitales normales. Pas de détresse.",
        "Signes vitaux: T° {temp}°C, TA {tension}, Pouls {pouls}. Patient {etat}.",
    ]
    
    symptomes = [
        "maux de tête persistants", "douleurs abdominales", "fièvre",
        "toux sèche", "difficultés respiratoires", "vertiges",
        "nausées", "fatigue générale", "douleurs thoraciques",
        "éruption cutanée", "douleurs articulaires"
    ]
    
    etats = ["stable", "conscient et cohérent", "apyrétique", "anxieux", "fatigué"]
    
    observations = []
    
    # Au moins 1-3 observations par session non terminée récente
    for session in sessions:
        if session.debut > timezone.now() - timedelta(days=15):
            nb_obs = random.randint(1, 3)
            
            for i in range(nb_obs):
                personnel = random.choice(personnel_medical)
                template = random.choice(observations_templates)
                
                observation_text = template.format(
                    temp=round(random.uniform(36.5, 39.5), 1),
                    tension=f"{random.randint(110, 150)}/{random.randint(70, 95)}",
                    pouls=random.randint(60, 100),
                    symptome=random.choice(symptomes),
                    etat=random.choice(etats)
                )
                
                date_obs = session.debut + timedelta(hours=i, minutes=random.randint(0, 59))
                
                obs = ObservationMedicale.objects.create(
                    id_personnel=personnel,
                    observation=observation_text,
                    id_session=session,
                    date_heure=date_obs
                )
                observations.append(obs)
    
    print(f"✅ {len(observations)} observations créées!")
    return observations


def create_prescriptions(sessions):
    """Crée des prescriptions de médicaments et d'examens."""
    print("💊 Création des prescriptions...")
    
    medecins = list(Medecin.objects.all())
    
    medicaments_liste = [
        "Paracétamol 500mg - 3x/jour pendant 5 jours",
        "Ibuprofène 400mg - 2x/jour pendant 3 jours",
        "Amoxicilline 1g - 3x/jour pendant 7 jours",
        "Metronidazole 500mg - 2x/jour pendant 5 jours",
        "Oméprazole 20mg - 1x/jour le matin",
        "Ciprofloxacine 500mg - 2x/jour pendant 7 jours",
        "Azithromycine 500mg - 1x/jour pendant 3 jours",
        "Dexaméthasone 4mg - 1 ampoule IM",
        "Diclofenac 75mg - 1 ampoule IM si douleur",
        "Vitamine B12 - 1 ampoule IM/semaine",
    ]
    
    examens_liste = [
        "Glycémie à jeun", "NFS (Numération Formule Sanguine)",
        "Créatininémie", "Transaminases (ALAT, ASAT)",
        "Radiographie thoracique", "Échographie abdominale",
        "ECG (Électrocardiogramme)", "Test de grossesse",
        "Goutte épaisse (Paludisme)", "Sérologie VIH",
        "Urée sanguine", "Bilan lipidique",
        "TSH (Thyréostimuline)", "Scanner cérébral",
        "IRM lombaire"
    ]
    
    prescriptions_med = []
    prescriptions_exam = []
    
    # Prescriptions pour sessions récentes
    for session in sessions:
        if session.debut > timezone.now() - timedelta(days=20) and random.random() > 0.3:
            medecin = random.choice(medecins)
            
            # Médicaments (60% de chance)
            if random.random() > 0.4:
                nb_med = random.randint(1, 3)
                medicaments = random.sample(medicaments_liste, nb_med)
                
                presc_med = PrescriptionMedicament.objects.create(
                    id_medecin=medecin,
                    liste_medicaments="\n".join(f"- {med}" for med in medicaments),
                    id_session=session,
                    date_heure=session.debut + timedelta(hours=random.randint(1, 4))
                )
                prescriptions_med.append(presc_med)
            
            # Examens (50% de chance)
            if random.random() > 0.5:
                examen = random.choice(examens_liste)
                
                presc_exam = PrescriptionExamen.objects.create(
                    id_medecin=medecin,
                    nom_examen=examen,
                    id_session=session,
                    date_heure=session.debut + timedelta(hours=random.randint(1, 3))
                )
                prescriptions_exam.append(presc_exam)
    
    print(f"✅ {len(prescriptions_med)} prescriptions de médicaments créées!")
    print(f"✅ {len(prescriptions_exam)} prescriptions d'examens créées!")
    return prescriptions_med, prescriptions_exam


def create_resultats_examens(prescriptions_exam):
    """Crée des résultats d'examens."""
    print("🔬 Création des résultats d'examens...")
    
    medecins = list(Medecin.objects.all())
    
    resultats_templates = {
        "Glycémie à jeun": "Glycémie: {val} g/L (Normale: 0.70-1.10)",
        "NFS (Numération Formule Sanguine)": "GB: {gb} /mm³, GR: {gr} M/mm³, Hb: {hb} g/dL",
        "Créatininémie": "Créatinine: {val} mg/L (Normale: 7-13)",
        "Radiographie thoracique": "Champs pulmonaires clairs. Cœur de taille normale.",
        "ECG (Électrocardiogramme)": "Rythme sinusal régulier. FC: {fc} bpm. Pas d'anomalie.",
        "Goutte épaisse (Paludisme)": "Résultat: {resultat}",
    }
    
    resultats = []
    
    # 70% des examens ont des résultats
    for presc in prescriptions_exam:
        if random.random() > 0.3:
            medecin = random.choice(medecins)
            
            # Template selon le type d'examen
            if presc.nom_examen in resultats_templates:
                template = resultats_templates[presc.nom_examen]
                resultat_text = template.format(
                    val=round(random.uniform(0.8, 1.2), 2),
                    gb=random.randint(4000, 10000),
                    gr=round(random.uniform(4.0, 5.5), 1),
                    hb=round(random.uniform(12.0, 16.0), 1),
                    fc=random.randint(60, 90),
                    resultat=random.choice(["NEGATIF", "POSITIF"])
                )
            else:
                resultat_text = f"{presc.nom_examen}: Résultats dans les normes."
            
            date_resultat = presc.date_heure + timedelta(hours=random.randint(2, 48))
            
            resultat = ResultatExamen.objects.create(
                id_medecin=medecin,
                resultat=resultat_text,
                id_prescription=presc,
                date_heure=date_resultat
            )
            resultats.append(resultat)
    
    print(f"✅ {len(resultats)} résultats d'examens créés!")
    return resultats


def create_hospitalisations(sessions, chambres):
    """Crée des hospitalisations."""
    print("🏥 Création des hospitalisations...")
    
    medecins = list(Medecin.objects.all())
    
    hospitalisations = []
    
    # 20% des sessions récentes donnent lieu à hospitalisation
    for session in sessions:
        if session.debut > timezone.now() - timedelta(days=25) and random.random() > 0.8:
            # Trouver une chambre disponible
            chambre = random.choice([c for c in chambres if c.nombre_places_dispo > 0])
            medecin = random.choice(medecins)
            
            debut_hosp = session.debut + timedelta(hours=random.randint(2, 12))
            
            # 50% sont encore en cours
            if random.random() > 0.5:
                statut = 'en cours'
                fin_hosp = None
            else:
                statut = 'terminee'
                fin_hosp = debut_hosp + timedelta(days=random.randint(1, 7))
                # Libérer la chambre
            
            hosp = Hospitalisation.objects.create(
                id_session=session,
                id_chambre=chambre,
                debut=debut_hosp,
                fin=fin_hosp,
                statut=statut,
                id_medecin=medecin
            )
            
            # Réduire places disponibles
            if statut == 'en cours':
                chambre.nombre_places_dispo -= 1
                chambre.save()
            
            hospitalisations.append(hosp)
    
    print(f"✅ {len(hospitalisations)} hospitalisations créées!")
    return hospitalisations


def create_rendez_vous(patients):
    """Crée des rendez-vous futurs."""
    print("📅 Création des rendez-vous...")
    
    medecins = list(Medecin.objects.all())
    
    rendez_vous = []
    
    # 50% des patients ont un rendez-vous futur
    for patient in patients:
        if random.random() > 0.5:
            medecin = random.choice(medecins)
            
            # Rendez-vous dans 1 à 30 jours
            jours_futurs = random.randint(1, 30)
            heure = random.randint(8, 17)
            date_rdv = timezone.now() + timedelta(days=jours_futurs, hours=heure)
            
            rdv = RendezVous.objects.create(
                date_heure=date_rdv,
                id_medecin=medecin,
                id_patient=patient
            )
            rendez_vous.append(rdv)
    
    print(f"✅ {len(rendez_vous)} rendez-vous créés!")
    return rendez_vous


def create_dossiers_patients(patients):
    """Crée des dossiers médicaux pour les patients."""
    print("📁 Création des dossiers patients...") 
    
    groupes_sanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    
    allergies_liste = [
        "Pénicilline", "Aspirine", "Arachides", "Lactose",
        "Aucune allergie connue", "Pollen", "Fruits de mer", "Iode"
    ]
    
    antecedents_liste = [
        "Hypertension artérielle", "Diabète type 2", "Asthme",
        "Aucun antécédent notable", "Chirurgie appendicectomie (2015)",
        "Paludisme récurrent", "Tuberculose traitée", "Ulcère gastrique"
    ]
    
    dossiers = []
    
    # 80% des patients ont un dossier
    for patient in patients:
        if random.random() > 0.2:
            dossier = DossierPatient.objects.create(
                id_patient=patient,
                groupe_sanguin=random.choice(groupes_sanguins),
                facteur_rhesus=random.choice(['+', '-']),
                poids=round(random.uniform(45.0, 95.0), 1),
                taille=round(random.uniform(1.50, 1.90), 2),
                allergies=random.choice(allergies_liste),
                antecedents=random.choice(antecedents_liste)
            )
            dossiers.append(dossier)
    
    print(f"✅ {len(dossiers)} dossiers patients créés!")
    return dossiers


def main():
    """Fonction principale."""
    print("\n" + "="*60)
    print("🏥 SCRIPT DE POPULATION DE LA BASE DE DONNÉES")
    print("="*60)
    
    # Nettoyer les anciennes données
    clear_all_data()
    
    # Créer les données dans l'ordre des dépendances
    patients = create_patients()
    chambres = create_chambres()
    sessions = create_sessions(patients)
    observations = create_observations(sessions)
    presc_med, presc_exam = create_prescriptions(sessions)
    resultats = create_resultats_examens(presc_exam)
    hospitalisations = create_hospitalisations(sessions, chambres)
    rendez_vous = create_rendez_vous(patients)
    dossiers = create_dossiers_patients(patients)
    
    # Résumé
    print("\n" + "="*60)
    print("✅ POPULATION TERMINÉE AVEC SUCCÈS!")
    print("="*60)
    print(f"👥 Patients:                    {len(patients)}")
    print(f"🛏️  Chambres:                    {len(chambres)}")
    print(f"📋 Sessions:                    {len(sessions)}")
    print(f"📝 Observations médicales:      {len(observations)}")
    print(f"💊 Prescriptions médicaments:   {len(presc_med)}")
    print(f"🔬 Prescriptions examens:       {len(presc_exam)}")
    print(f"📊 Résultats examens:           {len(resultats)}")
    print(f"🏥 Hospitalisations:            {len(hospitalisations)}")
    print(f"📅 Rendez-vous:                 {len(rendez_vous)}")
    print(f"📁 Dossiers patients:           {len(dossiers)}")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
