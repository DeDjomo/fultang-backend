"""
Modele PrescriptionExamen pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from apps.gestion_hospitaliere.models import Medecin
from .session import Session


class PrescriptionExamen(models.Model):
    """Modele pour les prescriptions d'examens."""

    id_medecin = models.ForeignKey(
        Medecin,
        on_delete=models.PROTECT,
        related_name='prescriptions_examens'
    )
    nom_examen = models.CharField(max_length=200)
    id_session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='prescriptions_examens'
    )
    date_heure = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_heure']
        verbose_name = 'Prescription Examen'
        verbose_name_plural = 'Prescriptions Examens'

    def __str__(self):
        return f"Prescription Examen {self.id} - {self.nom_examen}"
