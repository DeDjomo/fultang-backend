Installation
============

Ce guide explique comment installer et deployer le systeme de gestion Fultang Hospital.

Prerequis
----------

Avant de commencer, assurez-vous d'avoir installe :

* Docker (version 20.10 ou superieure)
* Docker Compose (version 2.0 ou superieure)
* Git

Installation avec Docker
-------------------------

1. Cloner le depot
~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   git clone <repository-url>
   cd fultang-backend

2. Configurer les variables d'environnement
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Copier le fichier d'exemple et le modifier :

.. code-block:: bash

   cp .env.example .env

Modifier les valeurs dans le fichier ``.env`` selon vos besoins.

3. Lancer les conteneurs
~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   docker-compose up -d

4. Executer les migrations
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   docker-compose exec web python manage.py migrate

5. Creer un superutilisateur
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   docker-compose exec web python manage.py createsuperuser

6. Collecter les fichiers statiques
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   docker-compose exec web python manage.py collectstatic --noinput

Verifier l'installation
------------------------

* API: http://localhost:8000/api/
* Admin: http://localhost:8000/admin/
* Swagger: http://localhost:8000/api/docs/
* ReDoc: http://localhost:8000/api/redoc/
* PgAdmin: http://localhost:5050/ (si active)

Installation en developpement (sans Docker)
--------------------------------------------

1. Creer un environnement virtuel
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python3.11 -m venv venv
   source venv/bin/activate

2. Installer les dependances
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   pip install -r requirements.txt

3. Configurer PostgreSQL
~~~~~~~~~~~~~~~~~~~~~~~~~

Creer une base de donnees PostgreSQL et mettre a jour le fichier ``.env``.

4. Executer les migrations
~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py migrate

5. Lancer le serveur
~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   python manage.py runserver
