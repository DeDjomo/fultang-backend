"""
Modele ResultatExamen pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from apps.gestion_hospitaliere.models import Medecin
from .prescription_examen import PrescriptionExamen


class ResultatExamen(models.Model):
    """Modele pour les resultats d'examens."""

    id_medecin = models.ForeignKey(
        Medecin,
        on_delete=models.PROTECT,
        related_name='resultats_examens'
    )
    resultat = models.TextField()
    id_prescription = models.ForeignKey(
        PrescriptionExamen,
        on_delete=models.CASCADE,
        related_name='resultats'
    )
    date_heure = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_heure']
        verbose_name = 'Resultat Examen'
        verbose_name_plural = 'Resultats Examens'

    def __str__(self):
        return f"Resultat {self.id} - Prescription {self.id_prescription.id}"
