"""
Modele RendezVous pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from apps.gestion_hospitaliere.models import Medecin
from .patient import Patient


class RendezVous(models.Model):
    """Modele pour les rendez-vous."""

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('effectue', 'Effectué'),
        ('annule', 'Annulé'),
    ]

    date_heure = models.DateTimeField()
    id_medecin = models.ForeignKey(
        Medecin,
        on_delete=models.PROTECT,
        related_name='rendez_vous'
    )
    id_patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='rendez_vous'
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )
    motif = models.TextField(
        blank=True,
        null=True,
        verbose_name='Motif de consultation'
    )

    class Meta:
        ordering = ['date_heure']
        verbose_name = 'Rendez-vous'
        verbose_name_plural = 'Rendez-vous'

    def __str__(self):
        return f"RDV {self.id} - {self.id_patient.matricule} avec Dr. {self.id_medecin.nom}"

