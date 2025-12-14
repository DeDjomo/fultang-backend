Fultang Hospital Management System - Documentation
===================================================

Bienvenue dans la documentation du systeme de gestion de l'hopital Fultang.

.. image:: https://img.shields.io/badge/Django-4.2.7-green.svg
   :target: https://www.djangoproject.com/
   :alt: Django Version

.. image:: https://img.shields.io/badge/Python-3.11-blue.svg
   :target: https://www.python.org/
   :alt: Python Version

.. image:: https://img.shields.io/badge/DRF-3.14.0-red.svg
   :target: https://www.django-rest-framework.org/
   :alt: Django REST Framework

Informations du Projet
-----------------------

:Auteur: DeDjomo
:Email: dedjomokarlyn@gmail.com
:Organisation: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
:Version: 1.0.0
:Date: 2025-12-14

Description
-----------

Systeme de gestion hospitaliere complet pour l'hopital Fultang, incluant :

* Gestion du personnel medical et administratif
* Gestion des patients et de leurs dossiers medicaux
* Gestion des services hospitaliers
* Systeme de sessions et consultations
* Gestion des prescriptions et examens
* Gestion des hospitalisations et chambres
* Systeme de rendez-vous
* Authentification et autorisation basee sur JWT
* Envoi d'emails automatiques
* Taches asynchrones avec Celery

Architecture
------------

Le systeme est construit avec :

* **Backend**: Django 4.2.7 + Django REST Framework
* **Base de donnees**: PostgreSQL 15
* **Authentification**: JWT (djangorestframework-simplejwt)
* **Documentation API**: drf-spectacular (OpenAPI/Swagger)
* **Taches asynchrones**: Celery + Redis
* **Containerisation**: Docker + Docker Compose

Table des Matieres
------------------

.. toctree::
   :maxdepth: 2
   :caption: Guide Utilisateur

   guide/installation
   guide/configuration
   guide/utilisation

.. toctree::
   :maxdepth: 2
   :caption: Architecture

   architecture/models
   architecture/api
   architecture/workflow

.. toctree::
   :maxdepth: 2
   :caption: Reference API

   api/services
   api/personnel
   api/patients
   api/sessions
   api/medical

.. toctree::
   :maxdepth: 2
   :caption: Developpement

   dev/setup
   dev/tests
   dev/contributing

Indices et tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
