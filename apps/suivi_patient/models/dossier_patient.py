"""
Modele DossierPatient pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from django.db import models
from django.core.validators import MinValueValidator
from .patient import Patient


class DossierPatient(models.Model):
    """Modele pour le dossier medical d'un patient."""

    GROUPE_SANGUIN_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]

    FACTEUR_RHESUS_CHOICES = [
        ('+', 'Positif'),
        ('-', 'Negatif'),
    ]

    id_patient = models.OneToOneField(
        Patient,
        on_delete=models.CASCADE,
        related_name='dossier_medical',
        primary_key=True
    )
    groupe_sanguin = models.CharField(
        max_length=3,
        choices=GROUPE_SANGUIN_CHOICES,
        blank=True,
        null=True
    )
    facteur_rhesus = models.CharField(
        max_length=1,
        choices=FACTEUR_RHESUS_CHOICES,
        blank=True,
        null=True
    )
    poids = models.FloatField(
        validators=[MinValueValidator(0.1)],
        blank=True,
        null=True,
        help_text="Poids en kg"
    )
    taille = models.FloatField(
        validators=[MinValueValidator(0.1)],
        blank=True,
        null=True,
        help_text="Taille en metres"
    )
    allergies = models.TextField(blank=True, null=True)
    antecedents = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = 'Dossier Patient'
        verbose_name_plural = 'Dossiers Patients'

    def __str__(self):
        return f"Dossier - {self.id_patient.matricule}"
