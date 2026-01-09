"""
Modèle PaiementMobile pour l'application comptabilite_financiere.
"""
from django.db import models

class PaiementMobile(models.Model):
    """
    Modèle pour gérer les paiements par mobile money (Orange Money, MTN Mobile Money).
    """
    OPERATEUR_CHOICES = [
        ('orange', 'Orange Money'),
        ('mtn', 'MTN Mobile Money'),
        ('autre', 'Autre'),
    ]

    id = models.AutoField(primary_key=True)
    
    numero_payant = models.CharField(
        max_length=20,
        verbose_name="Numéro du payant",
        help_text="Numéro de téléphone qui a effectué le paiement"
    )
    
    operateur = models.CharField(
        max_length=20,
        choices=OPERATEUR_CHOICES,
        default='orange',
        verbose_name="Opérateur"
    )
    
    reference_transaction = models.CharField(
        max_length=100,
        verbose_name="ID Transaction",
        help_text="Référence de la transaction mobile money"
    )
    
    quittance = models.OneToOneField(
        'comptabilite_financiere.Quittance',
        on_delete=models.CASCADE,
        related_name='paiement_mobile',
        verbose_name="Quittance"
    )
    
    class Meta:
        verbose_name = "Paiement Mobile"
        verbose_name_plural = "Paiements Mobiles"
        db_table = 'comptabilite_financiere_paiement_mobile'
    
    def __str__(self):
        return f"{self.operateur} - {self.numero_payant} ({self.reference_transaction})"
