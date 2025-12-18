"""
Phase IV - Tests Workflow Médecin
Scénario: Gestion des patients par un médecin

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import sys
from test_utils import APITester


def run_phase_4():
    """
    Phase IV - Workflow Médecin

    1. Connexion médecin
    2. Voir la liste des patients en attente dans son service
    3. Sélectionner un patient de la liste
    4. Enregistrer des observations médicales
    5. Consulter le dossier d'un patient
    6. Enregistrer prescriptions de médicaments
    7. Enregistrer prescriptions d'examens
    8. Enregistrer résultats d'examens
    9. Enregistrer une hospitalisation
    10. Consulter les chambres disponibles
    """

    tester = APITester()
    tester.print_header("PHASE IV - WORKFLOW MÉDECIN")

    # ==================== ÉTAPE 1: CONNEXION MÉDECIN ====================
    tester.print_section("ÉTAPE 1: Connexion Médecin")

    # Médecin créé en Phase I: Dr. Pierre Ondoa (Cardiologie)
    medecin_email = "pierre.ondoa@fultang.com"
    medecin_password = input("Entrez le mot de passe reçu par email pour pierre.ondoa@fultang.com: ")

    tester.print_info(f"Connexion avec: {medecin_email}")
    medecin_token = tester.login(medecin_email, medecin_password, role="medecin")

    if not medecin_token:
        tester.print_error("ÉCHEC: Impossible de se connecter en tant que médecin")
        tester.print_warning("Vérifiez le mot de passe reçu par email")
        return False

    # Récupérer les informations du médecin connecté
    result = tester.make_request(
        method='GET',
        endpoint='/medecins/',
        token=medecin_token,
        description="Récupération des informations du médecin connecté"
    )

    id_service = None
    id_medecin = None
    if result['success'] and 'data' in result:
        medecins = result['data'].get('data', [])
        for medecin in medecins:
            if medecin.get('email') == medecin_email:
                id_service = medecin.get('id_service')
                id_medecin = medecin.get('id')
                tester.store_data('medecin_id_service', id_service)
                tester.store_data('medecin_id', id_medecin)
                break

    # ==================== ÉTAPE 2: VOIR PATIENTS EN ATTENTE ====================
    tester.print_section("ÉTAPE 2: Voir Patients en Attente dans le Service")

    if id_service:
        result = tester.make_request(
            method='GET',
            endpoint='/medecin/patients-en-attente/',
            params={'id_service': id_service},
            token=medecin_token,
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
        tester.print_error("Service du médecin non trouvé")
        return False

    # ==================== ÉTAPE 3: SÉLECTIONNER DES PATIENTS ====================
    tester.print_section("ÉTAPE 3: Sélectionner des Patients")

    selected_sessions = []
    selected_patient_ids = []
    for i, patient in enumerate(patients_en_attente[:2]):  # Sélectionner les 2 premiers
        id_session = patient.get('id_session')
        id_patient = patient.get('id')
        if id_session:
            result = tester.make_request(
                method='POST',
                endpoint='/medecin/selectionner-patient/',
                data={'id_session': id_session},
                token=medecin_token,
                description=f"Sélection patient: {patient.get('prenom')} {patient.get('nom')}"
            )

            if result['success']:
                selected_sessions.append(id_session)
                selected_patient_ids.append(id_patient)

    # ==================== ÉTAPE 4: ENREGISTRER OBSERVATIONS ====================
    tester.print_section("ÉTAPE 4: Enregistrer Observations Médicales")

    observations_data = [
        {
            "id_personnel": id_medecin,
            "id_session": selected_sessions[0] if len(selected_sessions) > 0 else None,
            "observation": "Examen cardiologique complet effectué. ECG normal. "
                          "Échographie cardiaque montre une légère hypertrophie ventriculaire gauche. "
                          "Patient sous traitement pour hypertension. Tension artérielle: 145/92. "
                          "Recommandation: ajustement posologie et suivi dans 3 mois."
        },
        {
            "id_personnel": id_medecin,
            "id_session": selected_sessions[1] if len(selected_sessions) > 1 else None,
            "observation": "Patient se plaint de douleurs thoraciques intermittentes. "
                          "Auscultation cardiaque: rythme régulier, pas de souffle. "
                          "ECG de repos: rythme sinusal normal. "
                          "Prescription d'examens complémentaires pour investigation approfondie."
        },
    ]

    observation_ids = []
    for obs in observations_data:
        if obs['id_session']:
            result = tester.make_request(
                method='POST',
                endpoint='/medecin/observations/',
                data=obs,
                token=medecin_token,
                description=f"Enregistrement observation pour session {obs['id_session']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                obs_id = result['data']['data']['id']
                observation_ids.append(obs_id)

    # ==================== ÉTAPE 5: CONSULTER DOSSIER PATIENT ====================
    tester.print_section("ÉTAPE 5: Consulter Dossier des Patients")

    for patient_id in selected_patient_ids:
        result = tester.make_request(
            method='GET',
            endpoint=f'/medecin/dossier-patient/',
            params={'id_patient': patient_id},
            token=medecin_token,
            description=f"Consultation dossier patient ID {patient_id}"
        )

        if result['success']:
            tester.print_success(f"Dossier patient {patient_id} récupéré avec succès")

    # ==================== ÉTAPE 6: PRESCRIPTIONS MÉDICAMENTS ====================
    tester.print_section("ÉTAPE 6: Enregistrer Prescriptions de Médicaments")

    prescriptions_medicaments_data = [
        {
            "id_medecin": id_medecin,
            "id_session": selected_sessions[0] if len(selected_sessions) > 0 else None,
            "liste_medicaments": "1. Ramipril 10mg - 1 comprimé le matin\n"
                                "2. Amlodipine 5mg - 1 comprimé le soir\n"
                                "3. Aspirine 100mg - 1 comprimé par jour\n"
                                "Durée: 3 mois"
        },
        {
            "id_medecin": id_medecin,
            "id_session": selected_sessions[1] if len(selected_sessions) > 1 else None,
            "liste_medicaments": "1. Nitroglycérine sublinguale 0.5mg - En cas de douleur thoracique\n"
                                "2. Atorvastatine 20mg - 1 comprimé le soir\n"
                                "Durée: 1 mois"
        },
    ]

    prescription_med_ids = []
    for prescription in prescriptions_medicaments_data:
        if prescription['id_session']:
            result = tester.make_request(
                method='POST',
                endpoint='/prescriptions-medicaments/',
                data=prescription,
                token=medecin_token,
                description=f"Prescription médicaments pour session {prescription['id_session']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                presc_id = result['data']['data']['id']
                prescription_med_ids.append(presc_id)

    # ==================== ÉTAPE 7: PRESCRIPTIONS EXAMENS ====================
    tester.print_section("ÉTAPE 7: Enregistrer Prescriptions d'Examens")

    prescriptions_examens_data = [
        {
            "id_medecin": id_medecin,
            "id_session": selected_sessions[0] if len(selected_sessions) > 0 else None,
            "nom_examen": "Holter ECG 24h"
        },
        {
            "id_medecin": id_medecin,
            "id_session": selected_sessions[1] if len(selected_sessions) > 1 else None,
            "nom_examen": "Épreuve d'effort"
        },
        {
            "id_medecin": id_medecin,
            "id_session": selected_sessions[1] if len(selected_sessions) > 1 else None,
            "nom_examen": "Bilan lipidique complet"
        },
    ]

    prescription_exam_ids = []
    for prescription in prescriptions_examens_data:
        if prescription['id_session']:
            result = tester.make_request(
                method='POST',
                endpoint='/prescriptions-examens/',
                data=prescription,
                token=medecin_token,
                description=f"Prescription examen: {prescription['nom_examen']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                presc_id = result['data']['data']['id']
                prescription_exam_ids.append(presc_id)

    # ==================== ÉTAPE 8: RÉSULTATS EXAMENS ====================
    tester.print_section("ÉTAPE 8: Enregistrer Résultats d'Examens")

    # Simuler que certains examens ont été réalisés et qu'on enregistre les résultats
    resultats_examens_data = [
        {
            "id_medecin": id_medecin,
            "id_prescription": prescription_exam_ids[0] if len(prescription_exam_ids) > 0 else None,
            "resultat": "Holter ECG 24h:\n"
                       "- Rythme sinusal normal\n"
                       "- Quelques extrasystoles ventriculaires isolées (< 100/24h)\n"
                       "- Pas d'arythmie significative\n"
                       "- Conclusion: Résultat dans les limites de la normale"
        },
        {
            "id_medecin": id_medecin,
            "id_prescription": prescription_exam_ids[2] if len(prescription_exam_ids) > 2 else None,
            "resultat": "Bilan lipidique complet:\n"
                       "- Cholestérol total: 2.45 g/L (élevé)\n"
                       "- LDL: 1.65 g/L (élevé)\n"
                       "- HDL: 0.42 g/L (normal)\n"
                       "- Triglycérides: 1.85 g/L (élevé)\n"
                       "- Conclusion: Dyslipidémie mixte"
        },
    ]

    resultat_ids = []
    for resultat in resultats_examens_data:
        if resultat['id_prescription']:
            result = tester.make_request(
                method='POST',
                endpoint='/resultats-examens/',
                data=resultat,
                token=medecin_token,
                description=f"Enregistrement résultat examen prescription ID {resultat['id_prescription']}"
            )

            if result['success'] and 'data' in result and 'data' in result['data']:
                res_id = result['data']['data']['id']
                resultat_ids.append(res_id)

    # ==================== ÉTAPE 9: CONSULTER CHAMBRES DISPONIBLES ====================
    tester.print_section("ÉTAPE 9: Consulter Chambres Disponibles")

    # Toutes les chambres
    result = tester.make_request(
        method='GET',
        endpoint='/chambres/',
        token=medecin_token,
        description="Consultation de toutes les chambres"
    )

    if result['success']:
        tester.print_success("Liste des chambres récupérée")

    # Chambres avec places disponibles
    result = tester.make_request(
        method='GET',
        endpoint='/chambres/',
        params={'places_disponibles': 'true'},
        token=medecin_token,
        description="Consultation des chambres avec places disponibles"
    )

    chambre_disponible_id = None
    if result['success'] and 'data' in result:
        chambres = result['data'].get('data', [])
        if chambres:
            chambre_disponible_id = chambres[0]['id']
            tester.print_success(f"{len(chambres)} chambre(s) disponible(s)")

    # ==================== ÉTAPE 10: ENREGISTRER HOSPITALISATION ====================
    tester.print_section("ÉTAPE 10: Enregistrer une Hospitalisation")

    if chambre_disponible_id and len(selected_sessions) > 0:
        hospitalisation_data = {
            "id_session": selected_sessions[0],
            "id_chambre": chambre_disponible_id,
            "id_medecin": id_medecin
        }

        result = tester.make_request(
            method='POST',
            endpoint='/hospitalisations/',
            data=hospitalisation_data,
            token=medecin_token,
            description="Enregistrement hospitalisation"
        )

        hospitalisation_id = None
        if result['success'] and 'data' in result and 'data' in result['data']:
            hospitalisation_id = result['data']['data']['id']
            tester.print_success(f"Hospitalisation créée avec ID {hospitalisation_id}")

        # Vérifier que le nombre de places a diminué
        result = tester.make_request(
            method='GET',
            endpoint=f'/chambres/',
            token=medecin_token,
            description="Vérification diminution places disponibles"
        )

    # ==================== BONUS: LISTES DIVERSES ====================
    tester.print_section("BONUS: Consultations Diverses")

    # Toutes les prescriptions du médecin
    result = tester.make_request(
        method='GET',
        endpoint='/prescriptions-medicaments/',
        params={'id_medecin': id_medecin},
        token=medecin_token,
        description="Consultation prescriptions médicaments du médecin"
    )

    # Toutes les prescriptions d'examens du médecin
    result = tester.make_request(
        method='GET',
        endpoint='/prescriptions-examens/',
        params={'id_medecin': id_medecin},
        token=medecin_token,
        description="Consultation prescriptions examens du médecin"
    )

    # Tous les résultats d'examens du médecin
    result = tester.make_request(
        method='GET',
        endpoint='/resultats-examens/',
        params={'id_medecin': id_medecin},
        token=medecin_token,
        description="Consultation résultats examens du médecin"
    )

    # Chambres avec tarif > 30000
    result = tester.make_request(
        method='GET',
        endpoint='/chambres/',
        params={'tarif_min': 30000},
        token=medecin_token,
        description="Consultation chambres avec tarif > 30000"
    )

    # Chambres avec tarif < 50000
    result = tester.make_request(
        method='GET',
        endpoint='/chambres/',
        params={'tarif_max': 50000},
        token=medecin_token,
        description="Consultation chambres avec tarif < 50000"
    )

    # ==================== RÉSUMÉ ====================
    tester.print_summary()

    # Sauvegarder les données
    tester.store_data('medecin_token', medecin_token)
    tester.store_data('prescription_med_ids', prescription_med_ids)
    tester.store_data('prescription_exam_ids', prescription_exam_ids)
    tester.store_data('resultat_ids', resultat_ids)

    return tester.fail_count == 0


if __name__ == "__main__":
    success = run_phase_4()
    sys.exit(0 if success else 1)
