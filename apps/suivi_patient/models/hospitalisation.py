"""
Modele Hospitalisation pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from django.core.exceptions import ValidationError
from apps.gestion_hospitaliere.models import Medecin, Chambre
from .session import Session


class Hospitalisation(models.Model):
    """Modele pour les hospitalisations."""

    STATUT_CHOICES = [
        ('en cours', 'En cours'),
        ('terminee', 'Terminee'),
    ]

    id_session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='hospitalisations'
    )
    id_chambre = models.ForeignKey(
        Chambre,
        on_delete=models.PROTECT,
        related_name='hospitalisations'
    )
    debut = models.DateTimeField(auto_now_add=True)
    fin = models.DateTimeField(null=True, blank=True)
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en cours'
    )
    id_medecin = models.ForeignKey(
        Medecin,
        on_delete=models.PROTECT,
        related_name='hospitalisations'
    )

    class Meta:
        ordering = ['-debut']
        verbose_name = 'Hospitalisation'
        verbose_name_plural = 'Hospitalisations'

    def clean(self):
        """Valide que la chambre a des places disponibles."""
        if self.id_chambre and self.id_chambre.nombre_places_dispo <= 0:
            raise ValidationError(
                "Impossible d'enregistrer l'hospitalisation: la chambre n'a pas de places disponibles."
            )

    def save(self, *args, **kwargs):
        """Decremente le nombre de places disponibles lors de la creation."""
        is_new = self.pk is None
        self.full_clean()

        if is_new and self.id_chambre:
            self.id_chambre.nombre_places_dispo -= 1
            self.id_chambre.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Hospitalisation {self.id} - Chambre {self.id_chambre.numero_chambre}"
