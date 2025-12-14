"""
Modele Personnel pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .service import Service


class Personnel(AbstractUser):
    """Modele pour le personnel de l'hopital (etend AbstractUser)."""

    POSTE_CHOICES = [
        ('medecin', 'Medecin'),
        ('infirmier', 'Infirmier'),
        ('technicien', 'Technicien'),
        ('administratif', 'Administratif'),
        ('autre', 'Autre'),
    ]

    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('conge', 'En conge'),
        ('suspendu', 'Suspendu'),
    ]

    phone_validator = RegexValidator(
        regex=r'^6\d{8}$',
        message="Le numero de telephone doit contenir exactement 9 chiffres et commencer par 6."
    )

    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    email = models.EmailField(unique=True)
    contact = models.CharField(max_length=9, validators=[phone_validator])
    matricule = models.CharField(max_length=10, unique=True, blank=True)
    poste = models.CharField(max_length=20, choices=POSTE_CHOICES)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='actif')
    service = models.ForeignKey(
        Service,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='personnels'
    )
    password_expiry_date = models.DateTimeField(null=True, blank=True)
    first_login_done = models.BooleanField(default=False)

    class Meta:
        ordering = ['nom', 'prenom']
        verbose_name = 'Personnel'
        verbose_name_plural = 'Personnels'

    def save(self, *args, **kwargs):
        """Genere automatiquement le matricule et configure l'expiration du mot de passe."""
        if not self.matricule:
            year = timezone.now().year % 100
            last_personnel = Personnel.objects.order_by('-id').first()
            if last_personnel and last_personnel.id:
                numero = last_personnel.id + 1
            else:
                numero = 1
            self.matricule = f"{year}FUL{numero:04d}"

        if not self.password_expiry_date:
            expiry_days = getattr(settings, 'PASSWORD_EXPIRATION_DAYS', 3)
            self.password_expiry_date = timezone.now() + timedelta(days=expiry_days)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.matricule} - {self.nom} {self.prenom}"
