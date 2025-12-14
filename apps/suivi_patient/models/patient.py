"""
Modele Patient pour l'application suivi_patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from django.core.validators import RegexValidator, EmailValidator
from django.utils import timezone
from django.conf import settings


class Patient(models.Model):
    """Modele pour les patients."""

    phone_validator = RegexValidator(
        regex=r'^6\d{8}$',
        message="Le numero de telephone doit contenir exactement 9 chiffres et commencer par 6."
    )

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100, blank=True)
    date_naissance = models.DateField()
    adresse = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True, validators=[EmailValidator()])
    contact = models.CharField(max_length=9, unique=True, validators=[phone_validator])
    nom_proche = models.CharField(max_length=100)
    contact_proche = models.CharField(max_length=9, unique=True, validators=[phone_validator])
    matricule = models.CharField(max_length=10, unique=True, blank=True)
    date_inscription = models.DateField(auto_now_add=True)
    id_personnel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='patients_enregistres'
    )

    class Meta:
        ordering = ['-date_inscription']
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'

    def save(self, *args, **kwargs):
        """Genere automatiquement le matricule."""
        if not self.matricule:
            year = timezone.now().year % 100
            last_patient = Patient.objects.order_by('-id').first()
            if last_patient and last_patient.id:
                numero = last_patient.id + 1
            else:
                numero = 1
            self.matricule = f"{year}PAT{numero:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.prenom}"
