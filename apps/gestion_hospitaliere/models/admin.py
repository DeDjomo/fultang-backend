"""
Modele Admin pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from django.core.exceptions import ValidationError


class Admin(models.Model):
    """
    Modele pour l'administrateur systeme de l'hopital.

    Une seule entree autorisee dans cette table.
    Pas d'insertion possible apres la creation initiale.
    """

    login = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)

    class Meta:
        verbose_name = 'Administrateur'
        verbose_name_plural = 'Administrateurs'

    def save(self, *args, **kwargs):
        """Empeche la creation de plus d'une entree admin."""
        if not self.pk and Admin.objects.exists():
            raise ValidationError(
                "Un administrateur existe deja. Impossible de creer un nouvel administrateur. "
                "Veuillez modifier l'administrateur existant."
            )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Admin - {self.login}"
