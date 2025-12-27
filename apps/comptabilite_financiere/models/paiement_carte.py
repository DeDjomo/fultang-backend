"""
Modèle PaiementCarte pour l'application comptabilite_financiere.
"""
from django.db import models

class PaiementCarte(models.Model):
    """
    Modèle pour gérer les paiements par carte bancaire.
    """
    id = models.AutoField(primary_key=True)
    
    numero_carte_masque = models.CharField(
        max_length=20,
        verbose_name="Numéro de carte (masqué)",
        help_text="Les 4 derniers chiffres de la carte (ex: **** 1234)"
    )
    
    reference_transaction = models.CharField(
        max_length=100,
        verbose_name="Réf. Transaction",
        help_text="Référence de la transaction TPE/En ligne"
    )
    
    terminal_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="ID Terminal",
        help_text="Identifiant du terminal de paiement (optionnel)"
    )
    
    quittance = models.OneToOneField(
        'comptabilite_financiere.Quittance',
        on_delete=models.CASCADE,
        related_name='paiement_carte',
        verbose_name="Quittance"
    )
    
    class Meta:
        verbose_name = "Paiement Carte"
        verbose_name_plural = "Paiements Carte"
        db_table = 'comptabilite_financiere_paiement_carte'
    
    def __str__(self):
        return f"Carte {self.numero_carte_masque} - Ref: {self.reference_transaction}"
