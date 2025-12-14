#!/bin/bash

# ============================================
# Configuration
# ============================================
set -e  # Arrêter le script en cas d'erreur

# ============================================
# 1. Attendre que la base de données soit prête
# ============================================
echo "Verification de la disponibilite de la base de donnees..."

# Utiliser netcat pour vérifier si PostgreSQL est accessible
# Essayer plusieurs fois avec un délai entre chaque tentative
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if nc -z -w 2 "$DB_HOST" "$DB_PORT"; then
        echo "Base de donnees PostgreSQL disponible sur $DB_HOST:$DB_PORT"
        break
    fi
    
    echo "Tentative $attempt/$max_attempts - Base de donnees non disponible, nouvel essai dans 2 secondes..."
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "ERREUR : Impossible de se connecter à la base de donnees apres $max_attempts tentatives"
    echo "   Verifiez que:"
    echo "   1. Le service PostgreSQL est demarre"
    echo "   2. Les variables DB_HOST et DB_PORT sont correctes"
    echo "   3. Le reseau Docker est correctement configure"
    exit 1
fi

# ============================================
# 2. Attendre que PostgreSQL accepte les connexions
# ============================================
echo "Verification que PostgreSQL accepte les connexions..."

# Utiliser pg_isready pour vérifier l'état de PostgreSQL
for i in {1..10}; do
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; then
        echo "PostgreSQL pret a accepter les connexions"
        break
    fi
    
    if [ $i -eq 10 ]; then
        echo "ERREUR : PostgreSQL ne repond pas après 10 tentatives"
        exit 1
    fi
    
    echo "PostgreSQL ne repond pas encore, nouvel essai dans 3 secondes... ($i/10)"
    sleep 3
done

# ============================================
# 3. Créer et appliquer les migrations de base de données
# ============================================
echo "Creation des migrations si necessaire..."

# Créer les migrations pour toutes les apps
# Répond automatiquement 'y' aux questions de renommage de champs
yes | python manage.py makemigrations

echo "Application des migrations de base de donnees..."

# Appliquer les migrations
python manage.py migrate --noinput

echo "Migrations appliquees avec succes"

# ============================================
# 4. Collecter les fichiers statiques
# ============================================
echo "Collecte des fichiers statiques..."

# Mode développement : pas besoin de collectstatic à chaque fois
if [ "$DJANGO_DEBUG" = "False" ] || [ "$COLLECT_STATIC" = "True" ]; then
    python manage.py collectstatic --noinput --clear
    echo "Fichiers statiques collectes"
else
    echo "Mode développement : collectstatic ignoré"
fi

# ============================================
# 5. Créer un superutilisateur si demandé
# ============================================
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    echo "Verification/Creation du superutilisateur..."
    
    # Vérifier si le superutilisateur existe déjà
    if python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    print('Superutilisateur non trouvé, création en cours...')
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print('Superutilisateur créé avec succès')
else:
    print('Superutilisateur existe deja')
" 2>/dev/null; then
        echo "Superutilisateur configure"
    else
        echo "Impossible de verifier/creer le superutilisateur"
    fi
fi

# ============================================
# 6. Vérification de la santé de l'application
# ============================================
echo "🔍 Verification de la sante de l'application..."

# Vérifier si Django peut se lancer correctement
if python manage.py check --deploy 2>/dev/null || python manage.py check 2>/dev/null; then
    echo "Application Django en bonne sante"
else
    echo " Avertissements lors de la verification de l'application"
fi

# ============================================
# 7. Exécuter la commande passée
# ============================================
echo "Demarrage de l'application Django..."
echo "========================================"

# Exécuter la commande passée en paramètre (ou la commande par défaut)
exec "$@"