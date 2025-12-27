"""
Modèle Quittance pour l'application comptabilite_financiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Quittance(models.Model):
    """
    Modèle pour gérer les quittances de paiement.
    """
    
    TYPE_RECETTE_CHOICES = [
        ('consultation', 'Consultation'),
        ('hospitalisation', 'Hospitalisation'),
        ('pharmacie', 'Pharmacie'),
        ('laboratoire', 'Laboratoire'),
        ('imagerie', 'Imagerie'),
        ('soins', 'Soins'),
        ('autre', 'Autre'),
    ]
    
    MODE_PAIEMENT_CHOICES = [
        ('especes', 'Espèces'),
        ('carte', 'Carte bancaire'),
        ('mobile_money', 'Mobile Money'),
        ('virement', 'Virement'),
        ('cheque', 'Chèque'),
        ('autre', 'Autre'),
    ]
    
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
    
    type_recette = models.CharField(
        max_length=50,
        choices=TYPE_RECETTE_CHOICES,
        default='soins',
        verbose_name="Type de recette",
        help_text="Type de recette"
    )
    
    mode_paiement = models.CharField(
        max_length=50,
        choices=MODE_PAIEMENT_CHOICES,
        default='especes',
        verbose_name="Mode de paiement",
        help_text="Mode de paiement utilisé"
    )
    
    validee = models.BooleanField(
        default=False,
        verbose_name="Validée",
        help_text="Indique si la quittance a été validée par le comptable"
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
    
    # Champs pour le workflow comptable
    caissier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='quittances_emises',
        verbose_name="Caissier",
        help_text="Caissier ayant émis la quittance",
        null=True,
        blank=True
    )
    
    # Use IntegerField instead of ForeignKey since these models don't exist yet
    compte_comptable_id = models.IntegerField(
        verbose_name="Compte comptable ID",
        help_text="ID du compte comptable associé",
        null=True,
        blank=True,
        db_column='compte_comptable_id'
    )
    
    piece_recette_id = models.IntegerField(
        verbose_name="Pièce de recette ID",
        help_text="ID de la pièce de recette associée",
        null=True,
        blank=True,
        db_column='piece_recette_id'
    )
    
    date_affectation_compte = models.DateTimeField(
        verbose_name="Date d'affectation compte",
        help_text="Date d'affectation à un compte comptable",
        null=True,
        blank=True
    )
    
    id_comptable_affectation = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='quittances_affectees',
        verbose_name="Comptable d'affectation",
        help_text="Comptable ayant affecté la quittance",
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
