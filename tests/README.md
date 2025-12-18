# Tests API Fultang Hospital

Suite de tests complète pour l'API de gestion hospitalière Fultang.

## Structure

```
tests/
├── README.md                      # Ce fichier
├── test_utils.py                  # Utilitaires pour les tests
├── test_phase_1_deployment.py     # Phase I - Déploiement
├── test_phase_2_receptioniste.py  # Phase II - Workflow Réceptioniste
├── test_phase_3_infirmier.py      # Phase III - Workflow Infirmier
├── test_phase_4_medecin.py        # Phase IV - Workflow Médecin
├── run_all_tests.py               # Script principal Python
└── run_tests.sh                   # Script shell d'exécution
```

## Phases de Tests

### Phase I - Déploiement de l'Application

Configuration initiale de l'hôpital par l'administrateur:
- Connexion admin
- Création de tous les services (Urgences, Cardiologie, Pédiatrie, etc.)
- Création de personnels (tous postes: réceptioniste, caissier, infirmier, médecin, laborantin, pharmacien, comptable, directeur)
- Création de médecins avec spécialités
- Création de chambres avec différents tarifs

### Phase II - Workflow Réceptioniste

Gestion des patients par un réceptioniste:
- Connexion avec identifiants reçus par email
- Enregistrement de plusieurs patients
- Ouverture de sessions pour chaque patient
- Consultation de la liste des patients
- Création de rendez-vous (avec vérification disponibilité médecin)
- Consultation des hospitalisations

### Phase III - Workflow Infirmier

Prise en charge des patients par un infirmier:
- Connexion infirmier
- Consultation des patients en attente dans son service
- Sélection de patients
- Enregistrement d'observations médicales
- Redirection de patients (vers service ou personnel)

### Phase IV - Workflow Médecin

Diagnostic et traitement par un médecin:
- Connexion médecin
- Consultation des patients en attente dans son service
- Sélection de patients
- Enregistrement d'observations médicales
- Consultation du dossier patient
- Prescription de médicaments
- Prescription d'examens
- Enregistrement de résultats d'examens
- Consultation des chambres disponibles
- Enregistrement d'hospitalisation

## Prérequis

1. API Fultang démarrée sur `http://localhost:8000`
2. Python 3.x installé
3. Module `requests` installé: `pip install requests`
4. Un compte admin créé dans la base de données

### Création de l'Admin par Défaut

Avant d'exécuter les tests, créez un admin dans la base de données:

```bash
# Option 1: Via Django shell
python manage.py shell

# Puis dans le shell Python:
from apps.gestion_hospitaliere.models import Admin
admin = Admin.objects.create(
    email="admin@fultang.com",
    nom="Admin",
    prenom="Système"
)
admin.set_password("Admin@2024")
admin.save()
```

```bash
# Option 2: Via commande Django (si créée)
python manage.py createadmin
```

## Exécution des Tests

### Méthode 1: Script Shell (Recommandé)

```bash
cd tests
./run_tests.sh
```

### Méthode 2: Script Python

```bash
cd tests
python3 run_all_tests.py
```

### Méthode 3: Phases Individuelles

```bash
cd tests

# Phase I uniquement
python3 test_phase_1_deployment.py

# Phase II uniquement
python3 test_phase_2_receptioniste.py

# Phase III uniquement
python3 test_phase_3_infirmier.py

# Phase IV uniquement
python3 test_phase_4_medecin.py
```

## Identifiants de Test

### Admin
- Email: `admin@fultang.com`
- Mot de passe: `Admin@2024`

### Personnels (créés en Phase I)
Les mots de passe sont générés automatiquement et envoyés par email lors de la création.

**Pour récupérer les mots de passe depuis les logs Celery:**
```bash
docker logs django-celery-worker 2>&1 | grep "argsrepr"
```

**Ou définir manuellement un mot de passe:**
```bash
docker-compose exec -T web python manage.py shell <<'EOF'
from apps.gestion_hospitaliere.models import Personnel
p = Personnel.objects.get(email="marie.kamga@fultang.com")
p.set_password("Test@2024")
p.save()
print(f"Mot de passe défini pour {p.email}")
EOF
```

**Réceptioniste:**
- Marie Kamga: `marie.kamga@fultang.com`

**Infirmier:**
- Sophie Mballa: `sophie.mballa@fultang.com`

**Médecin:**
- Dr. Pierre Ondoa (Cardiologie): `pierre.ondoa@fultang.com`

## Fonctionnalités Testées

### Authentification
- Connexion avec email/matricule
- Gestion des tokens JWT
- Vérification des permissions

### Gestion des Services
- Création de services
- Consultation des services

### Gestion du Personnel
- Création de personnel (tous postes)
- Génération automatique de mots de passe
- Envoi d'emails avec identifiants

### Gestion des Médecins
- Création avec spécialités
- Consultation par spécialité
- Vérification de disponibilité

### Gestion des Patients
- Enregistrement de patients
- Ouverture de sessions
- Consultation du dossier

### Rendez-vous
- Création de rendez-vous
- Vérification disponibilité médecin (pas de conflit horaire)
- Consultation des rendez-vous

### Workflow Infirmier/Médecin
- Liste des patients en attente
- Sélection de patients
- Observations médicales
- Redirections

### Prescriptions
- Prescriptions de médicaments
- Prescriptions d'examens
- Résultats d'examens

### Hospitalisations
- Consultation des chambres
- Filtrage par disponibilité et tarif
- Création d'hospitalisation
- Diminution automatique des places disponibles

## Affichage des Résultats

Les tests affichent:
- Numéro de test et description
- Méthode HTTP et endpoint
- Données envoyées
- Code de statut HTTP
- Réponse du serveur
- Succès/Échec avec couleurs

Codes couleur:
- Vert: Succès
- Rouge: Échec
- Jaune: Avertissement
- Cyan: Information
- Bleu: Section

## Vérifications Importantes

### Rendez-vous
Les tests vérifient que:
- Un médecin ne peut pas avoir 2 rendez-vous à la même date/heure
- Le 6ème rendez-vous est rejeté (conflit horaire avec le 1er)

### Hospitalisations
Les tests vérifient que:
- Le nombre de places disponibles diminue après une hospitalisation
- On ne peut pas hospitaliser dans une chambre pleine

### Redirections
Les tests vérifient que:
- Le statut du patient passe à "en attente" après redirection
- Les patients sont visibles dans la file d'attente du service/personnel cible

## Dépannage

### L'API n'est pas accessible
```bash
# Vérifier que l'API tourne
curl http://localhost:8000/api/health/

# Démarrer l'API si nécessaire
python manage.py runserver
```

### Module 'requests' non trouvé
```bash
pip install requests
```

### Échec de connexion admin
Vérifiez que l'admin existe et que le mot de passe est correct:
```bash
python manage.py shell
```

```python
from apps.gestion_hospitaliere.models import Admin
admin = Admin.objects.get(email="admin@fultang.com")
admin.set_password("Admin@2024")
admin.save()
```

### Échec de connexion personnel
Les mots de passe sont envoyés par email lors de la création.
Vérifiez:
1. Configuration email dans `settings.py`
2. Logs d'envoi d'emails
3. Créez manuellement un mot de passe si nécessaire

## Notes

- Les tests doivent être exécutés dans l'ordre (Phase I → II → III → IV)
- La Phase I crée les données nécessaires pour les autres phases
- Chaque phase peut être exécutée indépendamment après la Phase I
- Les tests sont non-destructifs (pas de suppression de données)

## Auteur

**DeDjomo**
- Email: dedjomokarlyn@gmail.com
- Organisation: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
- Date: 2025-12-15
