#!/bin/bash
# Script shell pour exécuter les tests de l'API Fultang Hospital
#
# Author: DeDjomo
# Email: dedjomokarlyn@gmail.com
# Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
# Date: 2025-12-15

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Répertoire du script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   TESTS FULTANG HOSPITAL API   ${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Vérifier que Python est installé
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Erreur: Python 3 n'est pas installé${NC}"
    exit 1
fi

# Vérifier que les dépendances sont installées
echo -e "${YELLOW}Vérification des dépendances...${NC}"
python3 -c "import requests" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur: Le module 'requests' n'est pas installé${NC}"
    echo -e "${YELLOW}Installation: pip install requests${NC}"
    exit 1
fi

# Vérifier que l'API est accessible
echo -e "${YELLOW}Vérification de l'API...${NC}"
curl -s http://localhost:8000/api/health/ > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}Erreur: L'API n'est pas accessible à http://localhost:8000${NC}"
    echo -e "${YELLOW}Assurez-vous que l'API est démarrée${NC}"
    exit 1
fi
echo -e "${GREEN}API accessible ✓${NC}"
echo ""

# Exécuter les tests
cd "$SCRIPT_DIR"
python3 run_all_tests.py

# Récupérer le code de sortie
exit_code=$?

# Afficher le résultat final
echo ""
if [ $exit_code -eq 0 ]; then
    echo -e "${GREEN}Tests terminés avec succès ✓${NC}"
else
    echo -e "${RED}Tests terminés avec des erreurs ✗${NC}"
fi

exit $exit_code
