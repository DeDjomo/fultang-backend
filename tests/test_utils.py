"""
Utilitaires pour les tests de l'API Fultang Hospital.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import requests
import json
from typing import Dict, Any, Optional
from datetime import datetime, timedelta


class Colors:
    """Codes couleurs pour l'affichage terminal."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class APITester:
    """Classe utilitaire pour tester l'API."""

    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.tokens = {}
        self.data_store = {}
        self.test_count = 0
        self.success_count = 0
        self.fail_count = 0

    def print_header(self, text: str):
        """Affiche un header."""
        print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{text:^80}{Colors.ENDC}")
        print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

    def print_section(self, text: str):
        """Affiche une section."""
        print(f"\n{Colors.OKBLUE}{Colors.BOLD}{'-'*80}{Colors.ENDC}")
        print(f"{Colors.OKBLUE}{Colors.BOLD}{text}{Colors.ENDC}")
        print(f"{Colors.OKBLUE}{Colors.BOLD}{'-'*80}{Colors.ENDC}")

    def print_success(self, text: str):
        """Affiche un succès."""
        print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

    def print_error(self, text: str):
        """Affiche une erreur."""
        print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

    def print_info(self, text: str):
        """Affiche une info."""
        print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

    def print_warning(self, text: str):
        """Affiche un warning."""
        print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

    def make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        token: Optional[str] = None,
        params: Optional[Dict] = None,
        description: str = ""
    ) -> Dict[str, Any]:
        """
        Effectue une requête HTTP.

        Args:
            method: Méthode HTTP (GET, POST, PUT, DELETE, etc.)
            endpoint: Endpoint de l'API (ex: /login/)
            data: Données à envoyer
            token: Token JWT pour l'authentification
            params: Paramètres de requête
            description: Description du test

        Returns:
            Dict contenant la réponse
        """
        self.test_count += 1

        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        if token:
            headers['Authorization'] = f'Bearer {token}'

        print(f"\n{Colors.BOLD}Test #{self.test_count}: {description}{Colors.ENDC}")
        print(f"  {method} {endpoint}")

        if data:
            print(f"  Data: {json.dumps(data, indent=4, ensure_ascii=False)}")

        try:
            response = requests.request(
                method=method,
                url=url,
                json=data,
                headers=headers,
                params=params,
                timeout=10
            )

            print(f"  Status: {response.status_code}")

            try:
                response_data = response.json()
                print(f"  Response: {json.dumps(response_data, indent=4, ensure_ascii=False)[:500]}")
            except:
                response_data = {'text': response.text}
                print(f"  Response (text): {response.text[:200]}")

            if response.status_code in [200, 201]:
                self.success_count += 1
                self.print_success(f"{description} - SUCCÈS")
                return {
                    'success': True,
                    'status_code': response.status_code,
                    'data': response_data
                }
            else:
                self.fail_count += 1
                self.print_error(f"{description} - ÉCHEC (Status: {response.status_code})")
                return {
                    'success': False,
                    'status_code': response.status_code,
                    'data': response_data
                }

        except Exception as e:
            self.fail_count += 1
            self.print_error(f"{description} - ERREUR: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': None
            }

    def login(self, username: str, password: str, role: str = "user") -> Optional[str]:
        """
        Connexion et récupération du token.

        Args:
            username: Email ou matricule
            password: Mot de passe
            role: Rôle de l'utilisateur (pour le stockage du token)

        Returns:
            Token JWT ou None
        """
        result = self.make_request(
            method='POST',
            endpoint='/login/',
            data={'username': username, 'password': password},
            description=f"Connexion {role}: {username}"
        )

        if result['success'] and 'data' in result and 'data' in result['data']:
            token = result['data']['data']['access']
            self.tokens[role] = token
            self.print_success(f"Token {role} enregistré")
            return token
        else:
            self.print_error(f"Échec de connexion {role}")
            return None

    def store_data(self, key: str, value: Any):
        """Stocke une donnée pour utilisation ultérieure."""
        self.data_store[key] = value
        self.print_info(f"Données stockées: {key} = {value}")

    def get_data(self, key: str, default: Any = None) -> Any:
        """Récupère une donnée stockée."""
        return self.data_store.get(key, default)

    def print_summary(self):
        """Affiche le résumé des tests."""
        self.print_header("RÉSUMÉ DES TESTS")
        total = self.test_count
        success = self.success_count
        fail = self.fail_count
        success_rate = (success / total * 100) if total > 0 else 0

        print(f"Total de tests: {total}")
        print(f"{Colors.OKGREEN}Succès: {success}{Colors.ENDC}")
        print(f"{Colors.FAIL}Échecs: {fail}{Colors.ENDC}")
        print(f"Taux de réussite: {success_rate:.2f}%")

        if fail == 0:
            self.print_success("TOUS LES TESTS ONT RÉUSSI!")
        else:
            self.print_warning(f"{fail} test(s) ont échoué")

    def verify_rendez_vous_disponibilite(
        self,
        matricule_medecin: str,
        date_rdv: str,
        heure_rdv: str,
        token: str
    ) -> bool:
        """
        Vérifie la disponibilité du médecin pour un rendez-vous.

        Args:
            matricule_medecin: Matricule du médecin
            date_rdv: Date du rendez-vous (YYYY-MM-DD)
            heure_rdv: Heure du rendez-vous (HH:MM:SS)
            token: Token d'authentification

        Returns:
            True si le médecin est disponible, False sinon
        """
        # Récupérer tous les rendez-vous
        result = self.make_request(
            method='GET',
            endpoint='/rendez-vous/',
            token=token,
            description="Vérifier disponibilité médecin"
        )

        if not result['success']:
            return True  # En cas d'erreur, on assume disponible

        rendez_vous_list = result['data'].get('data', [])

        # Chercher un conflit
        datetime_rdv = f"{date_rdv}T{heure_rdv}"

        for rdv in rendez_vous_list:
            if (rdv.get('medecin_matricule') == matricule_medecin or
                rdv.get('id_medecin') == matricule_medecin):
                if rdv.get('date_heure', '').startswith(f"{date_rdv}T{heure_rdv}"):
                    self.print_warning(
                        f"Médecin {matricule_medecin} déjà occupé le {date_rdv} à {heure_rdv}"
                    )
                    return False

        self.print_success(f"Médecin {matricule_medecin} disponible le {date_rdv} à {heure_rdv}")
        return True
