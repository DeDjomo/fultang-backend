"""
Modèle Cheque pour l'application comptabilite_financiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-23
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class Cheque(models.Model):
    """
    Modèle pour gérer les chèques de paiement.
    """
    
    numero_cheque = models.AutoField(
        primary_key=True,
        verbose_name="Numéro du chèque"
    )
    
    date_emission = models.DateTimeField(
        default=timezone.now,
        verbose_name="Date d'émission",
        help_text="Date et heure d'émission du chèque (automatique)"
    )
    
    montant = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Montant",
        help_text="Montant du chèque (en FCFA)"
    )
    
    date_encaissement = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'encaissement",
        help_text="Date et heure d'encaissement du chèque"
    )
    
    patient = models.ForeignKey(
        'suivi_patient.Patient',
        on_delete=models.CASCADE,
        related_name='cheques',
        verbose_name="Patient",
        help_text="Patient associé à ce chèque"
    )
    
    class Meta:
        verbose_name = "Chèque"
        verbose_name_plural = "Chèques"
        ordering = ['-date_emission']
        db_table = 'comptabilite_financiere_cheque'
        indexes = [
            models.Index(fields=['-date_emission']),
            models.Index(fields=['patient']),
        ]
    
    def __str__(self):
        return f"Chèque #{self.numero_cheque} - {self.montant} FCFA"
    
    @property
    def est_encaisse(self):
        """Retourne True si le chèque a été encaissé."""
        return self.date_encaissement is not None
