"""
Phase II - Tests Workflow Réceptioniste
Scénario: Gestion des patients par un réceptioniste

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import sys
from test_utils import APITester
from datetime import datetime, timedelta


def run_phase_2():
    """
    Phase II - Workflow Réceptioniste

    1. Connexion réceptioniste (avec identifiants reçus par email)
    2. Enregistrement de plusieurs patients
    3. Ouverture de sessions pour chaque patient
    4. Consultation de la liste des patients
    5. Création de rendez-vous (avec vérification disponibilité médecin)
    6. Liste des hospitalisations
    """

    tester = APITester()
    tester.print_header("PHASE II - WORKFLOW RÉCEPTIONISTE")

    # ==================== ÉTAPE 1: CONNEXION RÉCEPTIONISTE ====================
    tester.print_section("ÉTAPE 1: Connexion Réceptioniste")

    # Note: Les identifiants sont envoyés par email lors de la création
    # Pour les tests, on utilise l'email du réceptioniste créé en Phase I
    receptioniste_email = "marie.kamga@fultang.com"
    receptioniste_password = input("Entrez le mot de passe reçu par email pour marie.kamga@fultang.com: ")

    tester.print_info(f"Connexion avec: {receptioniste_email}")
    recep_token = tester.login(receptioniste_email, receptioniste_password, role="receptioniste")

    if not recep_token:
        tester.print_error("ÉCHEC: Impossible de se connecter en tant que réceptioniste")
        tester.print_warning("Vérifiez le mot de passe reçu par email")
        return False

    # ==================== ÉTAPE 2: ENREGISTREMENT DES PATIENTS ====================
    tester.print_section("ÉTAPE 2: Enregistrement des Patients")

    # Récupérer l'ID du réceptioniste connecté
    recep_id = None
    personnel_result = tester.make_request(
        method='GET',
        endpoint='/personnel/',
        token=recep_token,
        description="Récupération ID réceptioniste"
    )

    if personnel_result['success'] and 'data' in personnel_result:
        # L'endpoint retourne un format paginé avec 'results'
        personnel_list = personnel_result['data'].get('results', personnel_result['data'].get('data', []))
        for p in personnel_list:
            if p.get('email') == receptioniste_email:
                recep_id = p.get('id')
                break

    patients_data = [
        {
            "nom": "Abanda",
            "prenom": "François",
            "date_naissance": "1985-03-15",
            "adresse": "Yaoundé, Melen",
            "contact": "677111222",
            "email": "francois.abanda@email.com",
            "nom_proche": "Marie Abanda",
            "contact_proche": "677111223",
            "id_personnel": recep_id
        },
        {
            "nom": "Ngo Bisse",
            "prenom": "Monique",
            "date_naissance": "1992-07-20",
            "adresse": "Yaoundé, Essos",
            "contact": "678333444",
            "email": "monique.ngobisse@email.com",
            "nom_proche": "Paul Ngo Bisse",
            "contact_proche": "678333445",
            "id_personnel": recep_id
        },
        {
            "nom": "Etame",
            "prenom": "Jean-Paul",
            "date_naissance": "2015-11-05",
            "adresse": "Yaoundé, Nkolndongo",
            "contact": "679555666",
            "email": "contact.etame@email.com",
            "nom_proche": "Sophie Etame",
            "contact_proche": "679555667",
            "id_personnel": recep_id
        },
        {
            "nom": "Mbarga",
            "prenom": "Sylvie",
            "date_naissance": "1978-01-12",
            "adresse": "Yaoundé, Bastos",
            "contact": "676777888",
            "email": "sylvie.mbarga@email.com",
            "nom_proche": "Jean Mbarga",
            "contact_proche": "676777889",
            "id_personnel": recep_id
        },
        {
            "nom": "Kuate",
            "prenom": "André",
            "date_naissance": "1960-09-25",
            "adresse": "Yaoundé, Odza",
            "contact": "675999000",
            "email": "andre.kuate@email.com",
            "nom_proche": "Christine Kuate",
            "contact_proche": "675999001",
            "id_personnel": recep_id
        },
    ]

    patient_ids = {}
    patient_matricules = {}
    for patient in patients_data:
        result = tester.make_request(
            method='POST',
            endpoint='/patients/',
            data=patient,
            token=recep_token,
            description=f"Enregistrement patient: {patient['prenom']} {patient['nom']}"
        )

        if result['success'] and 'data' in result and 'data' in result['data']:
            patient_id = result['data']['data']['id']
            patient_matricule = result['data']['data']['matricule']
            patient_ids[f"{patient['prenom']}_{patient['nom']}"] = patient_id
            patient_matricules[f"{patient['prenom']}_{patient['nom']}"] = patient_matricule
            tester.store_data(f"patient_{patient['nom'].lower()}", patient_id)
            tester.store_data(f"patient_matricule_{patient['nom'].lower()}", patient_matricule)

    # ==================== ÉTAPE 3: OUVERTURE DE SESSIONS ====================
    tester.print_section("ÉTAPE 3: Ouverture de Sessions pour les Patients")

    # Récupérer les IDs des services (depuis Phase I ou API)
    services_result = tester.make_request(
        method='GET',
        endpoint='/services/',
        token=recep_token,
        description="Récupération de la liste des services"
    )

    service_ids = {}
    if services_result['success'] and 'data' in services_result:
        services = services_result['data'].get('data', [])
        for service in services:
            service_ids[service['nom_service']] = service['id']

    # Définir les sessions à créer
    sessions_data = [
        {
            "id_patient": patient_ids.get("François_Abanda"),
            "id_service": service_ids.get("Cardiologie"),
            "motif": "Consultation de routine pour hypertension"
        },
        {
            "id_patient": patient_ids.get("Monique_Ngo Bisse"),
            "id_service": service_ids.get("Urgences"),
            "motif": "Contrôle glycémie et ajustement traitement"
        },
        {
            "id_patient": patient_ids.get("Jean-Paul_Etame"),
            "id_service": service_ids.get("Pédiatrie"),
            "motif": "Crise d'asthme"
        },
        {
            "id_patient": patient_ids.get("Sylvie_Mbarga"),
            "id_service": service_ids.get("Maternité"),
            "motif": "Consultation prénatale"
        },
        {
            "id_patient": patient_ids.get("André_Kuate"),
            "id_service": service_ids.get("Cardiologie"),
            "motif": "Suivi problèmes cardiaques"
        },
    ]

    session_ids = {}
    for session in sessions_data:
        if session['id_patient'] and session['id_service']:
            result = tester.make_request(
                method='POST',
                endpoint='/patients/ouvrir-session/',
                data=session,
                token=recep_token,
                description=f"Ouverture session patient ID {session['id_patient']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                session_id = result['data']['data']['id']
                session_ids[session['id_patient']] = session_id

    # ==================== ÉTAPE 4: CONSULTATION LISTE DES PATIENTS ====================
    tester.print_section("ÉTAPE 4: Consultation Liste des Patients")

    result = tester.make_request(
        method='GET',
        endpoint='/patients/',
        token=recep_token,
        description="Consultation de tous les patients"
    )

    if result['success']:
        tester.print_success(f"Liste des patients récupérée avec succès")

    # ==================== ÉTAPE 5: CRÉATION DE RENDEZ-VOUS ====================
    tester.print_section("ÉTAPE 5: Création de Rendez-vous (avec vérification disponibilité)")

    # Récupérer les médecins
    medecins_result = tester.make_request(
        method='GET',
        endpoint='/medecins/',
        token=recep_token,
        description="Récupération de la liste des médecins"
    )

    medecin_matricules = {}
    if medecins_result['success'] and 'data' in medecins_result:
        medecins = medecins_result['data'].get('data', [])
        for medecin in medecins:
            medecin_matricules[medecin.get('specialite', 'Généraliste')] = medecin.get('matricule')

    # Définir les rendez-vous à créer
    tomorrow = datetime.now() + timedelta(days=1)
    day_after = datetime.now() + timedelta(days=2)

    rendez_vous_data = [
        {
            "id_patient": patient_ids.get("François_Abanda"),
            "matricule_medecin": medecin_matricules.get("Cardiologie"),
            "date_rdv": tomorrow.strftime("%Y-%m-%d"),
            "heure_rdv": "09:00:00",
            "motif": "Consultation cardiologie"
        },
        {
            "id_patient": patient_ids.get("Monique_Ngo Bisse"),
            "matricule_medecin": medecin_matricules.get("Médecine Générale"),
            "date_rdv": tomorrow.strftime("%Y-%m-%d"),
            "heure_rdv": "10:30:00",
            "motif": "Suivi diabète"
        },
        {
            "id_patient": patient_ids.get("Jean-Paul_Etame"),
            "matricule_medecin": medecin_matricules.get("Pédiatrie"),
            "date_rdv": tomorrow.strftime("%Y-%m-%d"),
            "heure_rdv": "14:00:00",
            "motif": "Consultation pédiatrique"
        },
        {
            "id_patient": patient_ids.get("Sylvie_Mbarga"),
            "matricule_medecin": medecin_matricules.get("Gynécologie"),
            "date_rdv": day_after.strftime("%Y-%m-%d"),
            "heure_rdv": "09:00:00",
            "motif": "Consultation prénatale"
        },
        {
            "id_patient": patient_ids.get("André_Kuate"),
            "matricule_medecin": medecin_matricules.get("Cardiologie"),
            "date_rdv": day_after.strftime("%Y-%m-%d"),
            "heure_rdv": "11:00:00",
            "motif": "Suivi cardiaque"
        },
        # Test de conflit: même médecin, même heure
        {
            "id_patient": patient_ids.get("François_Abanda"),
            "matricule_medecin": medecin_matricules.get("Cardiologie"),
            "date_rdv": tomorrow.strftime("%Y-%m-%d"),
            "heure_rdv": "09:00:00",  # MÊME HEURE que le premier
            "motif": "Test conflit horaire"
        },
    ]

    rdv_ids = []
    for rdv in rendez_vous_data:
        if rdv['id_patient'] and rdv['matricule_medecin']:
            # Vérifier la disponibilité du médecin
            disponible = tester.verify_rendez_vous_disponibilite(
                rdv['matricule_medecin'],
                rdv['date_rdv'],
                rdv['heure_rdv'],
                recep_token
            )

            if not disponible:
                tester.print_warning(f"Médecin non disponible - RDV ignoré: {rdv['motif']}")
                continue

            result = tester.make_request(
                method='POST',
                endpoint='/rendez-vous/',
                data=rdv,
                token=recep_token,
                description=f"Création RDV: {rdv['motif']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                rdv_id = result['data']['data']['id']
                rdv_ids.append(rdv_id)

    # ==================== ÉTAPE 6: LISTE DES HOSPITALISATIONS ====================
    tester.print_section("ÉTAPE 6: Consultation Liste des Hospitalisations")

    result = tester.make_request(
        method='GET',
        endpoint='/hospitalisations/',
        token=recep_token,
        description="Consultation de toutes les hospitalisations"
    )

    if result['success']:
        tester.print_success("Liste des hospitalisations récupérée avec succès")

    # ==================== RÉSUMÉ ====================
    tester.print_summary()

    # Sauvegarder les données pour les phases suivantes
    tester.store_data('recep_token', recep_token)
    tester.store_data('patient_ids', patient_ids)
    tester.store_data('patient_matricules', patient_matricules)
    tester.store_data('session_ids', session_ids)
    tester.store_data('rdv_ids', rdv_ids)
    tester.store_data('medecin_matricules', medecin_matricules)

    return tester.fail_count == 0


if __name__ == "__main__":
    success = run_phase_2()
    sys.exit(0 if success else 1)
