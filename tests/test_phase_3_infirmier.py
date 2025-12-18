"""
Phase III - Tests Workflow Infirmier
Scénario: Gestion des patients par un infirmier

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import sys
from test_utils import APITester


def run_phase_3():
    """
    Phase III - Workflow Infirmier

    1. Connexion infirmier
    2. Voir la liste des patients en attente dans son service
    3. Sélectionner un patient de la liste
    4. Enregistrer des observations médicales
    5. Rediriger le patient (vers service ou vers personnel)
    """

    tester = APITester()
    tester.print_header("PHASE III - WORKFLOW INFIRMIER")

    # ==================== ÉTAPE 1: CONNEXION INFIRMIER ====================
    tester.print_section("ÉTAPE 1: Connexion Infirmier")

    # Infirmier créé en Phase I: Sophie Mballa (service Urgences)
    infirmier_email = "sophie.mballa@fultang.com"
    infirmier_password = input("Entrez le mot de passe reçu par email pour sophie.mballa@fultang.com: ")

    tester.print_info(f"Connexion avec: {infirmier_email}")
    infirmier_token = tester.login(infirmier_email, infirmier_password, role="infirmier")

    if not infirmier_token:
        tester.print_error("ÉCHEC: Impossible de se connecter en tant qu'infirmier")
        tester.print_warning("Vérifiez le mot de passe reçu par email")
        return False

    # Récupérer les informations de l'infirmier connecté
    result = tester.make_request(
        method='GET',
        endpoint='/personnel/',
        token=infirmier_token,
        description="Récupération des informations de l'infirmier connecté"
    )

    id_service = None
    id_personnel = None
    if result['success'] and 'data' in result:
        personnels = result['data'].get('data', [])
        for personnel in personnels:
            if personnel.get('email') == infirmier_email:
                id_service = personnel.get('id_service')
                id_personnel = personnel.get('id')
                tester.store_data('infirmier_id_service', id_service)
                tester.store_data('infirmier_id', id_personnel)
                break

    # ==================== ÉTAPE 2: VOIR PATIENTS EN ATTENTE ====================
    tester.print_section("ÉTAPE 2: Voir Patients en Attente dans le Service")

    if id_service:
        result = tester.make_request(
            method='GET',
            endpoint='/infirmier/patients-en-attente/',
            params={'id_service': id_service},
            token=infirmier_token,
            description="Consultation des patients en attente"
        )

        patients_en_attente = []
        if result['success'] and 'data' in result:
            patients_en_attente = result['data'].get('data', [])
            tester.print_success(f"{len(patients_en_attente)} patient(s) en attente trouvé(s)")

            # Afficher les patients
            for patient in patients_en_attente:
                tester.print_info(
                    f"Patient: {patient.get('prenom')} {patient.get('nom')} "
                    f"(Matricule: {patient.get('matricule')}, Session ID: {patient.get('id_session')})"
                )
    else:
        tester.print_error("Service de l'infirmier non trouvé")
        return False

    # ==================== ÉTAPE 3: SÉLECTIONNER UN PATIENT ====================
    tester.print_section("ÉTAPE 3: Sélectionner des Patients")

    # Sélectionner plusieurs patients (passer statut à 'reçu')
    selected_sessions = []
    for i, patient in enumerate(patients_en_attente[:3]):  # Sélectionner les 3 premiers
        id_session = patient.get('id_session')
        if id_session:
            result = tester.make_request(
                method='POST',
                endpoint='/infirmier/selectionner-patient/',
                data={'id_session': id_session},
                token=infirmier_token,
                description=f"Sélection patient: {patient.get('prenom')} {patient.get('nom')}"
            )

            if result['success']:
                selected_sessions.append(id_session)

    # ==================== ÉTAPE 4: ENREGISTRER OBSERVATIONS ====================
    tester.print_section("ÉTAPE 4: Enregistrer Observations Médicales")

    observations_data = [
        {
            "id_personnel": id_personnel,
            "id_session": selected_sessions[0] if len(selected_sessions) > 0 else None,
            "observation": "Patient présente une température de 38.5°C. Tension artérielle: 140/90. "
                          "Fréquence cardiaque: 85 bpm. Patient conscient et réactif. "
                          "Se plaint de maux de tête et fatigue."
        },
        {
            "id_personnel": id_personnel,
            "id_session": selected_sessions[1] if len(selected_sessions) > 1 else None,
            "observation": "Contrôle des signes vitaux: température 37.2°C, tension 120/80, "
                          "fréquence cardiaque 72 bpm. Patient stable. "
                          "Douleur thoracique signalée, intensité 4/10."
        },
        {
            "id_personnel": id_personnel,
            "id_session": selected_sessions[2] if len(selected_sessions) > 2 else None,
            "observation": "Examen initial: poids 32kg, taille 140cm. Température 37.8°C. "
                          "Patient pédiatrique avec difficultés respiratoires légères. "
                          "Auscultation pulmonaire: quelques sifflements. Saturation O2: 96%."
        },
    ]

    observation_ids = []
    for obs in observations_data:
        if obs['id_session']:
            result = tester.make_request(
                method='POST',
                endpoint='/infirmier/observations/',
                data=obs,
                token=infirmier_token,
                description=f"Enregistrement observation pour session {obs['id_session']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                obs_id = result['data']['data']['id']
                observation_ids.append(obs_id)

    # ==================== ÉTAPE 5: REDIRECTION PATIENTS ====================
    tester.print_section("ÉTAPE 5: Redirection des Patients")

    # Récupérer la liste des services pour les redirections
    services_result = tester.make_request(
        method='GET',
        endpoint='/services/',
        token=infirmier_token,
        description="Récupération de la liste des services"
    )

    redirections_data = [
        {
            "id_session": selected_sessions[0] if len(selected_sessions) > 0 else None,
            "type_redirection": "service",
            "redirection": "Cardiologie"
        },
        {
            "id_session": selected_sessions[1] if len(selected_sessions) > 1 else None,
            "type_redirection": "personnel",
            "redirection": "medecin"
        },
        {
            "id_session": selected_sessions[2] if len(selected_sessions) > 2 else None,
            "type_redirection": "service",
            "redirection": "Pédiatrie"
        },
    ]

    for redirection in redirections_data:
        if redirection['id_session']:
            result = tester.make_request(
                method='POST',
                endpoint='/infirmier/redirection/',
                data=redirection,
                token=infirmier_token,
                description=f"Redirection session {redirection['id_session']} vers {redirection['redirection']}"
            )

    # ==================== BONUS: VÉRIFICATION DES REDIRECTIONS ====================
    tester.print_section("BONUS: Vérification des Patients en Attente après Redirection")

    if id_service:
        result = tester.make_request(
            method='GET',
            endpoint='/infirmier/patients-en-attente/',
            params={'id_service': id_service},
            token=infirmier_token,
            description="Consultation des patients en attente (après redirections)"
        )

        if result['success'] and 'data' in result:
            patients_restants = result['data'].get('data', [])
            tester.print_success(f"{len(patients_restants)} patient(s) en attente restant(s)")

    # ==================== RÉSUMÉ ====================
    tester.print_summary()

    # Sauvegarder les données pour les phases suivantes
    tester.store_data('infirmier_token', infirmier_token)
    tester.store_data('observation_ids', observation_ids)
    tester.store_data('selected_sessions', selected_sessions)

    return tester.fail_count == 0


if __name__ == "__main__":
    success = run_phase_3()
    sys.exit(0 if success else 1)
