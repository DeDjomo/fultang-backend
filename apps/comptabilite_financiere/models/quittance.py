"""
Modèle Quittance pour l'application comptabilite_financiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from django.db import models
from django.core.validators import MinValueValidator


class Quittance(models.Model):
    """
    Modèle pour gérer les quittances de paiement.
    """
    
    idQuittance = models.AutoField(
        primary_key=True,
        verbose_name="Identifiant de la quittance"
    )
    
    numero_quittance = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Numéro de quittance",
        help_text="Numéro unique de la quittance"
    )
    
    date_paiement = models.DateTimeField(
        verbose_name="Date de paiement",
        help_text="Date et heure du paiement"
    )
    
    Montant_paye = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        verbose_name="Montant payé",
        help_text="Montant payé (en FCFA)"
    )
    
    Motif = models.TextField(
        verbose_name="Motif",
        help_text="Motif ou description du paiement"
    )
    
    id_session = models.ForeignKey(
        'suivi_patient.Session',
        on_delete=models.CASCADE,
        related_name='quittances',
        verbose_name="Session",
        help_text="Session associée à cette quittance",
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = "Quittance"
        verbose_name_plural = "Quittances"
        ordering = ['-date_paiement']
        db_table = 'comptabilite_financiere_quittance'
        indexes = [
            models.Index(fields=['-date_paiement']),
            models.Index(fields=['numero_quittance']),
        ]
    
    def __str__(self):
        return f"Quittance {self.numero_quittance} - {self.Montant_paye} FCFA"
