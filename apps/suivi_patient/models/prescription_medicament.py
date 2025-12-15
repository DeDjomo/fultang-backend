"""
Modele PrescriptionMedicament pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from apps.gestion_hospitaliere.models import Medecin
from .session import Session


class PrescriptionMedicament(models.Model):
    """Modele pour les prescriptions de medicaments."""

    id_medecin = models.ForeignKey(
        Medecin,
        on_delete=models.PROTECT,
        related_name='prescriptions_medicaments'
    )
    liste_medicaments = models.TextField()
    id_session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='prescriptions_medicaments'
    )
    date_heure = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_heure']
        verbose_name = 'Prescription Medicament'
        verbose_name_plural = 'Prescriptions Medicaments'

    def __str__(self):
        return f"Prescription {self.id} - Dr. {self.id_medecin.nom}"
