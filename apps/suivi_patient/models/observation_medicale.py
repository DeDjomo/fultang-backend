"""
Modele ObservationMedicale pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from django.conf import settings
from .session import Session


class ObservationMedicale(models.Model):
    """Modele pour les observations medicales."""

    id_personnel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='observations_medicales'
    )
    observation = models.TextField()
    date_heure = models.DateTimeField(auto_now_add=True)
    id_session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='observations_medicales'
    )

    class Meta:
        ordering = ['-date_heure']
        verbose_name = 'Observation Medicale'
        verbose_name_plural = 'Observations Medicales'

    def __str__(self):
        return f"Observation {self.id} - Session {self.id_session.id}"
