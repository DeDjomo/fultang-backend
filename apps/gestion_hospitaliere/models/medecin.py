"""
Modele Medecin pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from .personnel import Personnel


class Medecin(Personnel):
    """Modele pour les medecins (etend Personnel)."""

    specialite = models.CharField(max_length=100)

    class Meta:
        verbose_name = 'Medecin'
        verbose_name_plural = 'Medecins'

    def save(self, *args, **kwargs):
        """Force le poste a 'medecin'."""
        self.poste = 'medecin'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Dr. {self.nom} {self.prenom} - {self.specialite}"
