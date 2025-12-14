"""
Modele Session pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from django.conf import settings
from .patient import Patient


class Session(models.Model):
    """Modele pour les sessions de suivi patient."""

    STATUT_CHOICES = [
        ('en attente', 'En attente'),
        ('en cours', 'En cours'),
        ('terminee', 'Terminee'),
    ]

    SITUATION_CHOICES = [
        ('en attente', 'En attente'),
        ('recu', 'Recu'),
    ]

    debut = models.DateTimeField(auto_now_add=True)
    fin = models.DateTimeField(null=True, blank=True)
    id_patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='sessions'
    )
    id_personnel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='sessions_ouvertes'
    )
    service_courant = models.CharField(max_length=100)
    personnel_responsable = models.CharField(max_length=20)
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en cours'
    )
    situation_patient = models.CharField(
        max_length=20,
        choices=SITUATION_CHOICES,
        default='en attente'
    )

    class Meta:
        ordering = ['-debut']
        verbose_name = 'Session'
        verbose_name_plural = 'Sessions'

    def __str__(self):
        return f"Session {self.id} - {self.id_patient.matricule} ({self.statut})"
