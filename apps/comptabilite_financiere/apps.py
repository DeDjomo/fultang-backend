"""
Configuration de l'application comptabilite_financiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from django.apps import AppConfig


class ComptabiliteFinanciereConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.comptabilite_financiere'
    verbose_name = 'Comptabilité Financière'
