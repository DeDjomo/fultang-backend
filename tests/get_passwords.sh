#!/bin/bash
# Script pour afficher les mots de passe du personnel depuis Celery logs
#
# Author: DeDjomo
# Date: 2025-12-15

echo "==================================================================="
echo "MOTS DE PASSE DU PERSONNEL (depuis les logs Celery)"
echo "==================================================================="
echo ""

# Récupérer les mots de passe depuis les logs
docker logs django-celery-worker 2>&1 | grep "argsrepr" | while read line; do
    # Extraire l'ID et le mot de passe
    id=$(echo "$line" | grep -oP '\(\K[0-9]+(?=,)')
    password=$(echo "$line" | grep -oP "', '[^']+'\)" | sed "s/', '//g" | sed "s/'//g" | sed 's/)//g' || echo "$line" | grep -oP ', "[^"]+"\)' | sed 's/, "//g' | sed 's/"//g' | sed 's/)//g')

    if [ ! -z "$id" ] && [ ! -z "$password" ]; then
        echo "ID $id: $password"
    fi
done | sort -t' ' -k2 -n | uniq

echo ""
echo "==================================================================="
echo "Pour obtenir les emails correspondants, consultez la base de données:"
echo "  docker-compose exec -T web python manage.py shell"
echo "  >>> from apps.gestion_hospitaliere.models import Personnel, Medecin"
echo "  >>> Personnel.objects.get(id=26).email"
echo "==================================================================="
