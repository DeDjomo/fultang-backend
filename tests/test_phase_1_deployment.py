"""
Phase I - Tests de Déploiement
Scénario: Configuration initiale de l'hôpital par l'admin

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import sys
from test_utils import APITester


def run_phase_1():
    """
    Phase I - Déploiement de l'application

    1. Admin se connecte (credentials fournis au responsable IT)
    2. Création de tous les services
    3. Création de personnels (tous les postes)
    4. Création de médecins avec spécialités
    5. Création de chambres
    """

    tester = APITester()
    tester.print_header("PHASE I - DÉPLOIEMENT DE L'APPLICATION")

    # ==================== ÉTAPE 1: CONNEXION ADMIN ====================
    tester.print_section("ÉTAPE 1: Connexion Admin")

    # Note: L'admin par défaut doit être créé manuellement dans la base
    # ou via une commande Django (python manage.py createadmin)
    admin_email = "admin@fultang.com"
    admin_password = "Admin@2024"

    tester.print_info(f"Connexion avec: {admin_email}")
    admin_token = tester.login(admin_email, admin_password, role="admin")

    if not admin_token:
        tester.print_error("ÉCHEC: Impossible de se connecter en tant qu'admin")
        tester.print_warning("Assurez-vous que l'admin existe dans la base de données")
        return False

    # ==================== ÉTAPE 2: CRÉATION DES SERVICES ====================
    tester.print_section("ÉTAPE 2: Création des Services")

    services_data = [
        {
            "nom_service": "Urgences",
            "desc_service": "Service des urgences médicales",
            "chef_nom": "Biya",
            "chef_prenom": "Paul",
            "chef_date_naissance": "1980-05-15",
            "chef_email": "paul.biya@fultang.com",
            "chef_contact": "677000001",
            "chef_poste": "medecin",
            "chef_specialite": "Médecine d'urgence"
        },
        {
            "nom_service": "Cardiologie",
            "desc_service": "Service de cardiologie",
            "chef_nom": "Ahidjo",
            "chef_prenom": "Ahmadou",
            "chef_date_naissance": "1975-03-20",
            "chef_email": "ahmadou.ahidjo@fultang.com",
            "chef_contact": "677000002",
            "chef_poste": "medecin",
            "chef_specialite": "Cardiologie"
        },
        {
            "nom_service": "Pédiatrie",
            "desc_service": "Service de pédiatrie",
            "chef_nom": "Eto'o",
            "chef_prenom": "Samuel",
            "chef_date_naissance": "1978-11-10",
            "chef_email": "samuel.etoo@fultang.com",
            "chef_contact": "677000003",
            "chef_poste": "medecin",
            "chef_specialite": "Pédiatrie"
        },
        {
            "nom_service": "Chirurgie",
            "desc_service": "Service de chirurgie générale",
            "chef_nom": "Milla",
            "chef_prenom": "Roger",
            "chef_date_naissance": "1972-08-05",
            "chef_email": "roger.milla@fultang.com",
            "chef_contact": "677000004",
            "chef_poste": "medecin",
            "chef_specialite": "Chirurgie"
        },
        {
            "nom_service": "Maternité",
            "desc_service": "Service de maternité",
            "chef_nom": "Bella",
            "chef_prenom": "Jeanne",
            "chef_date_naissance": "1982-02-28",
            "chef_email": "jeanne.bella@fultang.com",
            "chef_contact": "677000005",
            "chef_poste": "medecin",
            "chef_specialite": "Gynécologie"
        },
    ]

    service_ids = {}
    for service in services_data:
        result = tester.make_request(
            method='POST',
            endpoint='/services/',
            data=service,
            token=admin_token,
            description=f"Création du service {service['nom_service']}"
        )

        if result['success'] and 'data' in result and 'data' in result['data']:
            service_id = result['data']['data']['id']
            service_ids[service['nom_service']] = service_id
            tester.store_data(f"service_{service['nom_service'].lower()}", service_id)

    # ==================== ÉTAPE 3: CRÉATION DES PERSONNELS ====================
    tester.print_section("ÉTAPE 3: Création des Personnels (tous postes)")

    personnels_data = [
        # Réceptionistes
        {
            "nom": "Kamga",
            "prenom": "Marie",
            "date_naissance": "1990-03-15",
            "email": "marie.kamga@fultang.com",
            "contact": "677123456",
            "poste": "receptioniste",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Bastos",
            "salaire": 150000.00
        },
        {
            "nom": "Foko",
            "prenom": "Jean",
            "date_naissance": "1988-07-22",
            "email": "jean.foko@fultang.com",
            "contact": "678234567",
            "poste": "receptioniste",
            "id_service": service_ids.get("Cardiologie"),
            "adresse": "Yaoundé, Omnisport",
            "salaire": 150000.00
        },

        # Caissiers
        {
            "nom": "Nkolo",
            "prenom": "Paul",
            "date_naissance": "1992-11-05",
            "email": "paul.nkolo@fultang.com",
            "contact": "679345678",
            "poste": "caissier",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Ngoa Ekelle",
            "salaire": 175000.00
        },

        # Infirmiers
        {
            "nom": "Mballa",
            "prenom": "Sophie",
            "date_naissance": "1985-06-18",
            "email": "sophie.mballa@fultang.com",
            "contact": "676456789",
            "poste": "infirmier",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Essos",
            "salaire": 200000.00
        },
        {
            "nom": "Ateba",
            "prenom": "Christian",
            "date_naissance": "1987-09-30",
            "email": "christian.ateba@fultang.com",
            "contact": "675567890",
            "poste": "infirmier",
            "id_service": service_ids.get("Pédiatrie"),
            "adresse": "Yaoundé, Emana",
            "salaire": 200000.00
        },

        # Laborantins
        {
            "nom": "Essomba",
            "prenom": "Alain",
            "date_naissance": "1983-12-10",
            "email": "alain.essomba@fultang.com",
            "contact": "674678901",
            "poste": "laborantin",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Etoudi",
            "salaire": 220000.00
        },

        # Pharmaciens
        {
            "nom": "Nguema",
            "prenom": "Beatrice",
            "date_naissance": "1989-04-25",
            "email": "beatrice.nguema@fultang.com",
            "contact": "673789012",
            "poste": "pharmacien",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Melen",
            "salaire": 250000.00
        },

        # Comptables
        {
            "nom": "Owona",
            "prenom": "Robert",
            "date_naissance": "1984-01-14",
            "email": "robert.owona@fultang.com",
            "contact": "672890123",
            "poste": "comptable",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Nlongkak",
            "salaire": 300000.00
        },

        # Directeur
        {
            "nom": "Mbassi",
            "prenom": "Emmanuel",
            "date_naissance": "1975-08-20",
            "email": "emmanuel.mbassi@fultang.com",
            "contact": "671901234",
            "poste": "directeur",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Bastos",
            "salaire": 500000.00
        },
    ]

    personnel_ids = {}
    for personnel in personnels_data:
        result = tester.make_request(
            method='POST',
            endpoint='/personnel/',
            data=personnel,
            token=admin_token,
            description=f"Création {personnel['poste']}: {personnel['prenom']} {personnel['nom']}"
        )

        if result['success'] and 'data' in result and 'data' in result['data']:
            personnel_id = result['data']['data']['id']
            personnel_ids[f"{personnel['prenom']}_{personnel['nom']}"] = personnel_id
            tester.store_data(f"personnel_{personnel['poste']}_{personnel['nom'].lower()}", personnel_id)

    # ==================== ÉTAPE 4: CRÉATION DES MÉDECINS ====================
    tester.print_section("ÉTAPE 4: Création des Médecins")

    medecins_data = [
        {
            "nom": "Ondoa",
            "prenom": "Dr. Pierre",
            "date_naissance": "1978-05-12",
            "email": "pierre.ondoa@fultang.com",
            "contact": "670012345",
            "poste": "medecin",
            "specialite": "Cardiologie",
            "id_service": service_ids.get("Cardiologie"),
            "adresse": "Yaoundé, Bastos",
            "salaire": 600000.00
        },
        {
            "nom": "Fotso",
            "prenom": "Dr. Celestine",
            "date_naissance": "1982-09-20",
            "email": "celestine.fotso@fultang.com",
            "contact": "669123456",
            "poste": "medecin",
            "specialite": "Pédiatrie",
            "id_service": service_ids.get("Pédiatrie"),
            "adresse": "Yaoundé, Santa Barbara",
            "salaire": 550000.00
        },
        {
            "nom": "Njoya",
            "prenom": "Dr. Ibrahim",
            "date_naissance": "1976-03-08",
            "email": "ibrahim.njoya@fultang.com",
            "contact": "668234567",
            "poste": "medecin",
            "specialite": "Chirurgie",
            "id_service": service_ids.get("Chirurgie"),
            "adresse": "Yaoundé, Tsinga",
            "salaire": 700000.00
        },
        {
            "nom": "Tchuente",
            "prenom": "Dr. Marie",
            "date_naissance": "1980-11-15",
            "email": "marie.tchuente@fultang.com",
            "contact": "667345678",
            "poste": "medecin",
            "specialite": "Gynécologie",
            "id_service": service_ids.get("Maternité"),
            "adresse": "Yaoundé, Odza",
            "salaire": 580000.00
        },
        {
            "nom": "Mbida",
            "prenom": "Dr. Thomas",
            "date_naissance": "1985-07-25",
            "email": "thomas.mbida@fultang.com",
            "contact": "666456789",
            "poste": "medecin",
            "specialite": "Médecine Générale",
            "id_service": service_ids.get("Urgences"),
            "adresse": "Yaoundé, Mokolo",
            "salaire": 500000.00
        },
    ]

    medecin_ids = {}
    for medecin in medecins_data:
        result = tester.make_request(
            method='POST',
            endpoint='/medecins/',
            data=medecin,
            token=admin_token,
            description=f"Création Médecin {medecin['specialite']}: {medecin['prenom']} {medecin['nom']}"
        )

        if result['success'] and 'data' in result and 'data' in result['data']:
            medecin_id = result['data']['data']['id']
            medecin_matricule = result['data']['data']['matricule']
            medecin_ids[f"{medecin['prenom']}_{medecin['nom']}"] = {
                'id': medecin_id,
                'matricule': medecin_matricule
            }
            tester.store_data(f"medecin_{medecin['nom'].lower()}", medecin_id)
            tester.store_data(f"medecin_matricule_{medecin['nom'].lower()}", medecin_matricule)

    # ==================== ÉTAPE 5: CRÉATION DES CHAMBRES ====================
    tester.print_section("ÉTAPE 5: Création des Chambres")

    chambres_data = [
        {"numero_chambre": "101", "nombre_places_total": 1, "tarif_journalier": 50000.00},
        {"numero_chambre": "102", "nombre_places_total": 1, "tarif_journalier": 50000.00},
        {"numero_chambre": "103", "nombre_places_total": 2, "tarif_journalier": 35000.00},
        {"numero_chambre": "104", "nombre_places_total": 2, "tarif_journalier": 35000.00},
        {"numero_chambre": "201", "nombre_places_total": 4, "tarif_journalier": 25000.00},
        {"numero_chambre": "202", "nombre_places_total": 4, "tarif_journalier": 25000.00},
        {"numero_chambre": "VIP1", "nombre_places_total": 1, "tarif_journalier": 100000.00},
        {"numero_chambre": "VIP2", "nombre_places_total": 1, "tarif_journalier": 100000.00},
    ]

    chambre_ids = {}
    for chambre in chambres_data:
        result = tester.make_request(
            method='POST',
            endpoint='/chambres/',
            data=chambre,
            token=admin_token,
            description=f"Création Chambre {chambre['numero_chambre']} ({chambre['nombre_places_total']} places)"
        )

        if result['success'] and 'data' in result and 'data' in result['data']:
            chambre_id = result['data']['data']['id']
            chambre_ids[chambre['numero_chambre']] = chambre_id
            tester.store_data(f"chambre_{chambre['numero_chambre']}", chambre_id)

    # ==================== RÉSUMÉ ====================
    tester.print_summary()

    # Sauvegarder les données pour les phases suivantes
    tester.store_data('admin_token', admin_token)
    tester.store_data('service_ids', service_ids)
    tester.store_data('personnel_ids', personnel_ids)
    tester.store_data('medecin_ids', medecin_ids)
    tester.store_data('chambre_ids', chambre_ids)

    return tester.fail_count == 0


if __name__ == "__main__":
    success = run_phase_1()
    sys.exit(0 if success else 1)
