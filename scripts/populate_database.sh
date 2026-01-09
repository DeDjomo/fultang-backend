#!/bin/bash
# ============================================
# Script de peuplement automatique de la base de données Fultang
# ============================================
#
# Usage: ./populate_database.sh [options]
#
# Options:
#   --clear-only    Vider la base de données uniquement (sans peupler)
#   --no-clear      Peupler sans vider la base de données d'abord
#   --help          Afficher cette aide
#
# ============================================

set -e  # Exit on first error

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

# Options
CLEAR_DB=true
POPULATE_DB=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clear-only)
            POPULATE_DB=false
            shift
            ;;
        --no-clear)
            CLEAR_DB=false
            shift
            ;;
        --help)
            echo "Usage: ./populate_database.sh [options]"
            echo ""
            echo "Options:"
            echo "  --clear-only    Vider la base de données uniquement (sans peupler)"
            echo "  --no-clear      Peupler sans vider la base de données d'abord"
            echo "  --help          Afficher cette aide"
            exit 0
            ;;
        *)
            echo -e "${RED}Option inconnue: $1${NC}"
            exit 1
            ;;
    esac
done

# Fonction pour exécuter un script Python via Docker
run_script() {
    local script_name=$1
    local description=$2
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}▶ $description${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if docker-compose exec -T web python manage.py shell < "$SCRIPT_DIR/$script_name"; then
        echo -e "${GREEN}✓ $description - TERMINÉ${NC}"
        echo ""
    else
        echo -e "${RED}✗ $description - ÉCHEC${NC}"
        exit 1
    fi
}

# Vérifier que Docker est lancé
echo -e "${BLUE}Vérification de Docker...${NC}"
cd "$BACKEND_DIR"

if ! docker-compose ps 2>/dev/null | grep -qE "(web|django-api-app).*Up"; then
    echo -e "${RED}✗ Le conteneur backend n'est pas en cours d'exécution.${NC}"
    echo -e "${YELLOW}Lancez d'abord: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker est prêt${NC}"
echo ""

# Afficher le résumé des actions
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       PEUPLEMENT DE LA BASE DE DONNÉES FULTANG              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$CLEAR_DB" = true ]; then
    echo -e "${YELLOW}• La base de données sera vidée${NC}"
fi
if [ "$POPULATE_DB" = true ]; then
    echo -e "${YELLOW}• La base de données sera peuplée avec les données de test${NC}"
fi
echo ""

# Confirmation
read -p "Continuer? (o/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${YELLOW}Opération annulée.${NC}"
    exit 0
fi

echo ""
START_TIME=$(date +%s)

# ============================================
# ÉTAPE 0: Vider la base de données
# ============================================
if [ "$CLEAR_DB" = true ]; then
    run_script "00_clear_database.py" "Étape 0: Vidage de la base de données"
fi

# ============================================
# ÉTAPES 1-13: Peuplement
# ============================================
if [ "$POPULATE_DB" = true ]; then
    run_script "01_create_services.py" "Étape 1: Création des services (5)"
    run_script "02_create_personnel.py" "Étape 2: Création du personnel (71)"
    run_script "03_create_medecins.py" "Étape 3: Création des médecins (25)"
    run_script "04_assign_chefs_service.py" "Étape 4: Assignation des chefs de service"
    run_script "05_create_chambres.py" "Étape 5: Création des chambres (17)"
    run_script "06_create_patients.py" "Étape 6: Création des patients (100)"
    run_script "07_create_dossiers.py" "Étape 7: Création des dossiers patients (100)"
    run_script "08_create_sessions.py" "Étape 8: Création des sessions (50)"
    run_script "09_create_observations_prescriptions.py" "Étape 9: Création observations, prescriptions et résultats"
    run_script "10_create_rendez_vous.py" "Étape 10: Création des rendez-vous (125)"
    run_script "11_create_hospitalisations.py" "Étape 11: Création des hospitalisations (50)"
    run_script "12_create_quittances.py" "Étape 12: Création des quittances (150)"
    run_script "13_update_passwords.py" "Étape 13: Mise à jour des mots de passe"
    run_script "14_create_compta_financiere.py" "Étape 14: Population Comptabilité Financière"
    run_script "15_create_compta_matiere.py" "Étape 15: Population Comptabilité Matière"
fi

# ============================================
# RÉSULTAT FINAL
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              PEUPLEMENT TERMINÉ AVEC SUCCÈS !               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Durée totale: ${DURATION} secondes${NC}"
echo ""
echo -e "${YELLOW}Connexion:${NC}"
echo "  • Admin: admin / Admin@123"
echo "  • Autres: [email] / MonMot2Passe!"
echo ""
echo -e "${YELLOW}Exemples d'emails:${NC}"
echo "  • comptable@matiere1.com"
echo "  • user@pharmacie1.com"
echo "  • medecin@chirurgie1.com"
echo "  • infirmier@urgences1.com"
echo ""
