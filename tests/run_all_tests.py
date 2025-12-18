#!/usr/bin/env python3
"""
Script principal pour exécuter tous les tests de l'API Fultang Hospital

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import sys
import subprocess
from test_utils import Colors


def print_banner():
    """Affiche la bannière de démarrage."""
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'TESTS FULTANG HOSPITAL API':^80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")


def print_phase_header(phase_num, phase_name):
    """Affiche l'en-tête d'une phase."""
    print(f"\n{Colors.OKBLUE}{Colors.BOLD}{'#'*80}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}{Colors.BOLD}PHASE {phase_num}: {phase_name}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}{Colors.BOLD}{'#'*80}{Colors.ENDC}\n")


def run_phase(script_name, phase_num, phase_name):
    """
    Exécute un script de test de phase.

    Args:
        script_name: Nom du fichier script Python
        phase_num: Numéro de la phase
        phase_name: Nom de la phase

    Returns:
        True si succès, False sinon
    """
    print_phase_header(phase_num, phase_name)

    try:
        result = subprocess.run(
            ['python3', script_name],
            capture_output=False,
            text=True
        )

        if result.returncode == 0:
            print(f"\n{Colors.OKGREEN}{Colors.BOLD}✓ PHASE {phase_num} TERMINÉE AVEC SUCCÈS{Colors.ENDC}\n")
            return True
        else:
            print(f"\n{Colors.FAIL}{Colors.BOLD}✗ PHASE {phase_num} A ÉCHOUÉ{Colors.ENDC}\n")
            return False

    except Exception as e:
        print(f"\n{Colors.FAIL}{Colors.BOLD}✗ ERREUR LORS DE L'EXÉCUTION DE LA PHASE {phase_num}: {str(e)}{Colors.ENDC}\n")
        return False


def print_final_summary(results):
    """
    Affiche le résumé final de tous les tests.

    Args:
        results: Dictionnaire des résultats par phase
    """
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'RÉSUMÉ FINAL':^80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

    total_phases = len(results)
    success_count = sum(1 for success in results.values() if success)
    fail_count = total_phases - success_count

    for phase, success in results.items():
        if success:
            print(f"{Colors.OKGREEN}✓ {phase}: SUCCÈS{Colors.ENDC}")
        else:
            print(f"{Colors.FAIL}✗ {phase}: ÉCHEC{Colors.ENDC}")

    print(f"\n{Colors.BOLD}Total phases: {total_phases}{Colors.ENDC}")
    print(f"{Colors.OKGREEN}Succès: {success_count}{Colors.ENDC}")
    print(f"{Colors.FAIL}Échecs: {fail_count}{Colors.ENDC}")

    success_rate = (success_count / total_phases * 100) if total_phases > 0 else 0
    print(f"{Colors.BOLD}Taux de réussite: {success_rate:.2f}%{Colors.ENDC}\n")

    if fail_count == 0:
        print(f"{Colors.OKGREEN}{Colors.BOLD}🎉 TOUS LES TESTS ONT RÉUSSI! 🎉{Colors.ENDC}\n")
    else:
        print(f"{Colors.WARNING}{Colors.BOLD}⚠ {fail_count} phase(s) ont échoué{Colors.ENDC}\n")


def main():
    """Fonction principale."""
    print_banner()

    print(f"{Colors.OKCYAN}Ce script va exécuter les 4 phases de tests:{Colors.ENDC}")
    print(f"{Colors.OKCYAN}  Phase I   - Déploiement de l'application{Colors.ENDC}")
    print(f"{Colors.OKCYAN}  Phase II  - Workflow Réceptioniste{Colors.ENDC}")
    print(f"{Colors.OKCYAN}  Phase III - Workflow Infirmier{Colors.ENDC}")
    print(f"{Colors.OKCYAN}  Phase IV  - Workflow Médecin{Colors.ENDC}\n")

    print(f"{Colors.WARNING}IMPORTANT:{Colors.ENDC}")
    print(f"{Colors.WARNING}1. Assurez-vous que l'API est démarrée (http://localhost:8000){Colors.ENDC}")
    print(f"{Colors.WARNING}2. Assurez-vous qu'un admin existe dans la base de données{Colors.ENDC}")
    print(f"{Colors.WARNING}3. Vous devrez fournir les mots de passe reçus par email{Colors.ENDC}\n")

    response = input(f"{Colors.BOLD}Voulez-vous continuer? (o/n): {Colors.ENDC}")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print(f"{Colors.WARNING}Tests annulés par l'utilisateur{Colors.ENDC}")
        sys.exit(0)

    # Dictionnaire pour stocker les résultats
    results = {}

    # Phase I - Déploiement
    phase1_success = run_phase(
        'test_phase_1_deployment.py',
        1,
        'DÉPLOIEMENT DE L\'APPLICATION'
    )
    results['Phase I - Déploiement'] = phase1_success

    if not phase1_success:
        print(f"{Colors.FAIL}La Phase I a échoué. Impossible de continuer.{Colors.ENDC}")
        print_final_summary(results)
        sys.exit(1)

    # Demander si on continue
    response = input(f"\n{Colors.BOLD}Phase I terminée. Continuer avec Phase II? (o/n): {Colors.ENDC}")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print(f"{Colors.WARNING}Tests arrêtés par l'utilisateur{Colors.ENDC}")
        print_final_summary(results)
        sys.exit(0)

    # Phase II - Réceptioniste
    phase2_success = run_phase(
        'test_phase_2_receptioniste.py',
        2,
        'WORKFLOW RÉCEPTIONISTE'
    )
    results['Phase II - Réceptioniste'] = phase2_success

    # Demander si on continue
    response = input(f"\n{Colors.BOLD}Phase II terminée. Continuer avec Phase III? (o/n): {Colors.ENDC}")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print(f"{Colors.WARNING}Tests arrêtés par l'utilisateur{Colors.ENDC}")
        print_final_summary(results)
        sys.exit(0)

    # Phase III - Infirmier
    phase3_success = run_phase(
        'test_phase_3_infirmier.py',
        3,
        'WORKFLOW INFIRMIER'
    )
    results['Phase III - Infirmier'] = phase3_success

    # Demander si on continue
    response = input(f"\n{Colors.BOLD}Phase III terminée. Continuer avec Phase IV? (o/n): {Colors.ENDC}")
    if response.lower() not in ['o', 'oui', 'y', 'yes']:
        print(f"{Colors.WARNING}Tests arrêtés par l'utilisateur{Colors.ENDC}")
        print_final_summary(results)
        sys.exit(0)

    # Phase IV - Médecin
    phase4_success = run_phase(
        'test_phase_4_medecin.py',
        4,
        'WORKFLOW MÉDECIN'
    )
    results['Phase IV - Médecin'] = phase4_success

    # Résumé final
    print_final_summary(results)

    # Code de sortie
    all_success = all(results.values())
    sys.exit(0 if all_success else 1)


if __name__ == "__main__":
    main()
