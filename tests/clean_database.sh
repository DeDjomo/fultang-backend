#!/bin/bash
# Script pour nettoyer la base de données avant les tests
#
# Author: DeDjomo
# Email: dedjomokarlyn@gmail.com
# Date: 2025-12-15

echo "Nettoyage de la base de données..."

docker-compose exec -T web python manage.py shell <<'EOF'
from apps.gestion_hospitaliere.models import *
from apps.suivi_patient.models import *

# Supprimer les données de test (garder seulement l'admin)
print("Suppression des chambres...")
Chambre.objects.all().delete()

print("Suppression des hospitalisations...")
Hospitalisation.objects.all().delete()

print("Suppression des résultats d'examens...")
ResultatExamen.objects.all().delete()

print("Suppression des prescriptions d'examens...")
PrescriptionExamen.objects.all().delete()

print("Suppression des prescriptions de médicaments...")
PrescriptionMedicament.objects.all().delete()

print("Suppression des observations médicales...")
ObservationMedicale.objects.all().delete()

print("Suppression des sessions...")
Session.objects.all().delete()

print("Suppression des rendez-vous...")
RendezVous.objects.all().delete()

print("Suppression des patients...")
Patient.objects.all().delete()

print("Suppression des médecins...")
Medecin.objects.all().delete()

print("Suppression du personnel...")
Personnel.objects.all().delete()

print("Suppression des services...")
Service.objects.all().delete()

print("")
print("✓ Base de données nettoyée avec succès!")
print("Note: L'admin a été conservé")
EOF

echo "Nettoyage terminé!"
