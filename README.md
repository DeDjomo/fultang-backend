# Fultang Hospital - Backend API

Bienvenue dans le backend de l'application de gestion hospitalière **Fultang Hospital**. Ce projet est construit avec **Django REST Framework** et est entièrement conteneurisé avec **Docker** pour faciliter le déploiement.

## Fonctionnalités

- **API REST** : Django REST Framework avec authentification JWT
- **WebSocket** : Mises à jour en temps réel via Django Channels
- **Base de données** : PostgreSQL 15
- **Cache & Queue** : Redis pour Celery et WebSocket
- **Tâches asynchrones** : Celery Worker + Beat
- **Documentation** : Swagger/OpenAPI

---

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

1.  **Docker** : [Installer Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/Mac) ou Docker Engine (Linux).
2.  **Docker Compose** : Généralement inclus avec Docker Desktop. Vérifiez l'installation avec `docker-compose --version`.
3.  **Git** : Pour cloner le projet.

---

## Installation et Démarrage Rapide

Suivez ces étapes pour déployer le backend sur votre machine locale.

### 1. Cloner le projet

Si ce n'est pas déjà fait, clonez le dépôt et accédez au dossier du backend :

```bash
git clone https://github.com/DeDjomo/fultang-backend
cd fultang-backend
```

### 2. Configurer les variables d'environnement

Copiez le fichier d'exemple `.env.example` vers un nouveau fichier `.env` :

```bash
cp .env.example .env
```

> **Note :** Vous pouvez modifier le fichier `.env` pour changer les mots de passe ou les ports si nécessaire, mais la configuration par défaut fonctionne parfaitement pour le développement local.

### 3. Construire et lancer les conteneurs

Utilisez Docker Compose pour construire les images et démarrer les services (Django, PostgreSQL, Redis, Celery, PgAdmin) :

```bash
docker-compose up --build -d
```

*   L'option `--build` force la reconstruction des images.
*   L'option `-d` (detached) lance les conteneurs en arrière-plan.

Attendez quelques instants que tous les services soient "Healthy" (surtout la base de données). Vous pouvez vérifier l'état avec :

```bash
docker-compose ps
```

---

## Initialisation de la Base de Données

Une fois les conteneurs lancés, vous devez préparer la base de données.

### 1. Appliquer les migrations

Créez les tables dans la base de données PostgreSQL :

```bash
docker-compose exec web python manage.py makemigrations 
docker-compose exec web python manage.py migrate
```

### 2. Créer un super-utilisateur (Admin)

Créez un compte administrateur pour accéder à l'interface d'administration Django :

```bash
docker-compose exec web python manage.py createsuperuser
```
Suivez les instructions pour définir un nom d'utilisateur, un email et un mot de passe.

### 3. Peupler la base de données (Optionnel mais recommandé)

Le projet contient des scripts pour générer des données de test (patients, médecins, rendez-vous, etc.) afin que l'application ne soit pas vide.

Pour lancer le script de population complet :

```bash
docker-compose exec web python populate_database.py
```

Ou pour une population plus légère : `python populate_fixed.py`.

---

## Accès à l'Application

Une fois tout configuré, vous pouvez accéder aux différents services :

| Service | URL | Description |
|---------|-----|-------------|
| **API Backend** | `http://localhost:8000/api/` | Endpoints REST |
| **Admin Django** | `http://localhost:8000/admin/` | Interface d'administration |
| **Swagger** | `http://localhost:8000/api/schema/swagger-ui/` | Documentation API interactive |
| **ReDoc** | `http://localhost:8000/api/schema/redoc/` | Documentation API |
| **PgAdmin** | `http://localhost:5050` | Interface PostgreSQL |
| **WebSocket** | `ws://localhost:8000/ws/updates/` | Mises à jour temps réel |

> **PgAdmin** - Email : `admin@admin.com`, Mot de passe : `admin` (voir `.env`)

---

## 🔌 WebSocket - Mises à Jour en Temps Réel

Le backend supporte les WebSocket pour envoyer des notifications en temps réel au frontend lorsque les données changent (patients, rendez-vous, factures, etc.).

### Comment ça marche

1. Le frontend se connecte à `ws://localhost:8000/ws/updates/`
2. Quand un modèle est créé/modifié/supprimé, un message est envoyé à tous les clients connectés
3. Le frontend reçoit le message et rafraîchit les données automatiquement

### Format des messages WebSocket

```json
{
    "type": "model_update",
    "model": "patient",
    "action": "create",
    "id": 123,
    "timestamp": "2025-12-26T11:30:00Z"
}
```

### Modèles supportés

- `patient` - Patients
- `appointment` - Rendez-vous
- `session` - Sessions (dossiers médicaux)
- `facture` - Factures
- `paiement` - Paiements
- `consultation` - Consultations
- `personnel` - Personnel hospitalier

---

## Commandes Utiles

Voici quelques commandes Docker Compose fréquemment utilisées :

| Commande | Description |
|----------|-------------|
| `docker-compose up -d` | Démarrer les conteneurs |
| `docker-compose down` | Arrêter les conteneurs |
| `docker-compose logs -f web` | Voir les logs du backend |
| `docker-compose exec web bash` | Accéder au shell du conteneur |
| `docker-compose down -v` | Supprimer tout (⚠️ efface la BDD) |
| `docker-compose build --no-cache web` | Rebuild l'image web |

### Après une mise à jour du code

```bash
# Arrêter et rebuild
docker-compose down
docker-compose build --no-cache web
docker-compose up -d
```

---

## Structure du Projet

```
fultang-backend/
├── api/                    # Configuration principale Django
│   ├── settings/           # Settings (base, development, production)
│   ├── consumers.py        # WebSocket consumers
│   ├── routing.py          # WebSocket routing
│   ├── signals.py          # Signaux pour WebSocket
│   └── asgi.py             # Configuration ASGI (Daphne)
├── apps/                   # Applications Django
│   ├── gestion_hospitaliere/   # Personnel, services
│   ├── suivi_patient/          # Patients, consultations, RDV
│   ├── comptabilite_matiere/   # Stocks, pharmacie
│   └── comptabilite_financiere/# Factures, paiements
├── Dockerfile              # Image Docker (Daphne/ASGI)
├── docker-compose.yml      # Orchestration des services
├── requirements.txt        # Dépendances Python
└── entrypoint.sh           # Script de lancement
```

---

## Technologies Utilisées

- **Django 4.2** + Django REST Framework
- **Django Channels 4.0** (WebSocket via Daphne)
- **PostgreSQL 15** (Base de données)
- **Redis 7** (Cache, Celery broker, WebSocket channel layer)
- **Celery** (Tâches asynchrones)
- **Docker** (Conteneurisation)

---

## Auteur

**DeDjomo** - dedjomokarlyn@gmail.com  
**Organisation** : ENSPY (École Nationale Supérieure Polytechnique de Yaoundé)