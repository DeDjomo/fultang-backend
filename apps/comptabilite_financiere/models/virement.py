"""
Modèle VirementBancaire pour l'application comptabilite_financiere.
"""
from django.db import models
from django.utils import timezone

class VirementBancaire(models.Model):
    """
    Modèle pour gérer les paiements par virement bancaire.
    """
    id = models.AutoField(primary_key=True)
    
    banque_emettrice = models.CharField(
        max_length=100,
        verbose_name="Banque émettrice",
        help_text="Nom de la banque d'où provient le virement"
    )
    
    reference_virement = models.CharField(
        max_length=100,
        verbose_name="Référence",
        help_text="Référence ou motif du virement"
    )
    
    date_virement = models.DateField(
        default=timezone.now,
        verbose_name="Date du virement"
    )
    
    compte_source = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name="Compte source (optionnel)",
        help_text="Numéro du compte débité"
    )
    
    quittance = models.OneToOneField(
        'comptabilite_financiere.Quittance',
        on_delete=models.CASCADE,
        related_name='virement_bancaire',
        verbose_name="Quittance"
    )
    
    class Meta:
        verbose_name = "Virement Bancaire"
        verbose_name_plural = "Virements Bancaires"
        db_table = 'comptabilite_financiere_virement'
    
    def __str__(self):
        return f"Virement {self.banque_emettrice} - {self.reference_virement}"
