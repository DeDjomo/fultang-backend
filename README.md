# Fultang Hospital - Backend API

Bienvenue dans le backend de l'application de gestion hospitalière **Fultang Hospital**. Ce projet est construit avec **Django REST Framework** et est entièrement conteneurisé avec **Docker** pour faciliter le déploiement.

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
*   L'option `-d` (etached) lance les conteneurs en arrière-plan.

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

*   **API Backend** : `http://localhost:8000/api/`
*   **Interface Admin Django** : `http://localhost:8000/admin/`
*   **Documentation API (Swagger/ReDoc)** : `http://localhost:8000/api/schema/swagger-ui/` ou `http://localhost:8000/api/schema/redoc/`
*   **PgAdmin (Base de données)** : `http://localhost:5050`
    *   *Email* : `admin@admin.com` (voir `.env`)
    *   *Mot de passe* : `admin` (voir `.env`)

---

## Commandes Utiles

Voici quelques commandes Docker Compose fréquemment utilisées :

*   **Arrêter les conteneurs** :
    ```bash
    docker-compose down
    ```

*   **Voir les logs (très utile en cas d'erreur)** :
    ```bash
    docker-compose logs -f web
    ```
    *(Remplacez `web` par `db`, `celery`, ou `redis` pour voir les logs des autres services)*.

*   **Accéder au shell du conteneur Django** :
    ```bash
    docker-compose exec web bash
    ```

*   **Supprimer tout (conteneurs et volumes de données)** :
    Attention, cela efface toute la base de données !
    ```bash
    docker-compose down -v
    ```

---

## Structure du Projet

*   `apps/` : Contient les applications Django (modules métiers : gestion_hospitaliere, suivi_patient, etc.).
*   `api/` : Configuration principale du projet Django (settings, urls).
*   `Dockerfile` : Définition de l'image Docker pour Django.
*   `docker-compose.yml` : Orchestration des services.
*   `requirements.txt` : Dépendances Python.
*   `entrypoint.sh` : Script de lancement du conteneur.