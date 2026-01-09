# 📊 Peuplement de la Base de Données Fultang

Ce dossier contient les scripts pour peupler automatiquement la base de données de l'application Fultang avec des données de test réalistes.

## 🚀 Utilisation Rapide

```bash
# Exécuter tout le peuplement automatiquement
./scripts/populate_database.sh
```

## 📁 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `populate_database.sh` | **Script principal** - Exécute toutes les étapes automatiquement |
| `00_clear_database.py` | Vide toutes les tables (conserve l'admin) |
| `01_create_services.py` | Crée 5 services hospitaliers |
| `02_create_personnel.py` | Crée 71 personnels (réceptionnistes, infirmiers, etc.) |
| `03_create_medecins.py` | Crée 25 médecins (5 par service) |
| `04_assign_chefs_service.py` | Assigne un chef à chaque service |
| `05_create_chambres.py` | Crée 17 chambres (61 places) |
| `06_create_patients.py` | Crée 100 patients |
| `07_create_dossiers.py` | Crée 100 dossiers médicaux |
| `08_create_sessions.py` | Crée 50 sessions (10/service) |
| `09_create_observations_prescriptions.py` | Crée observations et prescriptions |
| `10_create_rendez_vous.py` | Crée 125 rendez-vous |
| `11_create_hospitalisations.py` | Crée 50 hospitalisations |
| `12_create_quittances.py` | Crée 150 quittances |
| `13_update_passwords.py` | Met tous les mots de passe à `MonMot2Passe!` |

## ⚙️ Options du Script Principal

```bash
# Peuplement complet (vider + peupler)
./scripts/populate_database.sh

# Vider la base uniquement
./scripts/populate_database.sh --clear-only

# Peupler sans vider (ajouter aux données existantes)
./scripts/populate_database.sh --no-clear

# Afficher l'aide
./scripts/populate_database.sh --help
```

## 📊 Données Créées

| Table | Nombre | Détails |
|-------|--------|---------|
| Services | 5 | Chirurgie, Médecine Générale, Pédiatrie, Urgences, Laboratoire |
| Personnel | 71 | 5 comptables, 5 pharmaciens, 5 caissiers, 5 réceptionnistes, 25 infirmiers, 25 laborantins, 1 directeur |
| Médecins | 25 | 5 par service avec spécialités |
| Chambres | 17 | 61 places réparties par service |
| Patients | 100 | Données camerounaises réalistes |
| Dossiers | 100 | Groupe sanguin, poids, allergies... |
| Sessions | 50 | 10 par service (statut: en cours) |
| Observations | 250 | 5 par session |
| Prescriptions | ~186 | Médicaments et examens |
| Rendez-vous | 125 | 5 par médecin |
| Hospitalisations | 50 | 1 par session |
| Quittances | 150 | ~12M FCFA au total |

## 🔐 Informations de Connexion

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | `admin` | `Admin@123` |
| Directeur | `user@direction.com` | `MonMot2Passe!` |
| Comptable | `comptable@matiere{1-5}.com` | `MonMot2Passe!` |
| Pharmacien | `user@pharmacie{1-5}.com` | `MonMot2Passe!` |
| Caissier | `user@caisse{1-5}.com` | `MonMot2Passe!` |
| Réceptionniste | `user@reception{1-5}.com` | `MonMot2Passe!` |
| Infirmier | `infirmier@{service}{1-5}.com` | `MonMot2Passe!` |
| Laborantin | `laborantin@{service}{1-5}.com` | `MonMot2Passe!` |
| Médecin | `medecin@{service}{1-5}.com` | `MonMot2Passe!` |

**Services:** `chirurgie`, `medecinegenerale`, `pediatrie`, `urgences`, `laboratoire`

### Exemples

```
medecin@chirurgie1.com          → Chirurgien #1
infirmier@urgences3.com         → Infirmier #3 des urgences
laborantin@laboratoire2.com     → Laborantin #2
```

## 🐳 Prérequis

- Docker et Docker Compose installés
- Conteneurs lancés : `docker-compose up -d`

## 🔄 Exécution Manuelle d'un Script

```bash
docker-compose exec -T web python manage.py shell < scripts/NOM_DU_SCRIPT.py
```

## ⏱️ Durée

Le peuplement complet prend environ **2-3 minutes**.
