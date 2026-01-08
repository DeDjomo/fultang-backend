"""
Modèle EcritureComptable pour l'application comptabilite_financiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone


class Journal(models.Model):
    """
    Modèle pour les journaux comptables.
    
    Journaux standards:
    - JC: Journal de Caisse (espèces)
    - JB: Journal de Banque (virements, chèques, cartes)
    - JMM: Journal de Mobile Money
    - JOD: Journal des Opérations Diverses
    """
    
    CODE_CHOICES = [
        ('JC', 'Journal de Caisse'),
        ('JB', 'Journal de Banque'),
        ('JMM', 'Journal de Mobile Money'),
        ('JOD', 'Journal des Opérations Diverses'),
    ]
    
    code = models.CharField(
        max_length=10,
        unique=True,
        primary_key=True,
        choices=CODE_CHOICES,
        verbose_name="Code du journal",
        help_text="Code unique du journal (JC, JB, JMM, JOD)"
    )
    
    libelle = models.CharField(
        max_length=100,
        verbose_name="Libellé",
        help_text="Nom complet du journal"
    )
    
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description",
        help_text="Description du journal"
    )
    
    compte_contrepartie = models.ForeignKey(
        'CompteComptable',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='journaux_associes',
        verbose_name="Compte de contrepartie",
        help_text="Compte utilisé par défaut pour ce journal (ex: 571 pour Caisse)"
    )
    
    actif = models.BooleanField(
        default=True,
        verbose_name="Actif",
        help_text="Indique si le journal est actif"
    )
    
    class Meta:
        verbose_name = "Journal"
        verbose_name_plural = "Journaux"
        db_table = 'comptabilite_financiere_journal'
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.libelle}"


class EcritureComptable(models.Model):
    """
    Modèle pour une écriture comptable.
    
    Une écriture représente une transaction comptable complète
    qui peut contenir plusieurs lignes (partie double).
    """
    
    STATUT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('validee', 'Validée'),
        ('annulee', 'Annulée'),
    ]
    
    numero_ecriture = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Numéro d'écriture",
        help_text="Numéro unique de l'écriture (ex: EC-2025-00001)"
    )
    
    date_ecriture = models.DateField(
        default=timezone.now,
        verbose_name="Date de l'écriture",
        help_text="Date comptable de l'écriture"
    )
    
    journal = models.ForeignKey(
        Journal,
        on_delete=models.PROTECT,
        related_name='ecritures',
        verbose_name="Journal",
        help_text="Journal dans lequel l'écriture est enregistrée"
    )
    
    libelle = models.CharField(
        max_length=255,
        verbose_name="Libellé",
        help_text="Description de l'écriture"
    )
    
    quittance = models.OneToOneField(
        'Quittance',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ecriture_comptable',
        verbose_name="Quittance source",
        help_text="Quittance à l'origine de cette écriture"
    )
    
    piece_justificative = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name="Pièce justificative",
        help_text="Référence de la pièce justificative"
    )
    
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='validee',
        verbose_name="Statut",
        help_text="Statut de l'écriture"
    )
    
    comptable = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ecritures_creees',
        verbose_name="Comptable",
        help_text="Comptable ayant créé l'écriture"
    )
    
    date_creation = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de création"
    )
    
    date_modification = models.DateTimeField(
        auto_now=True,
        verbose_name="Date de modification"
    )
    
    class Meta:
        verbose_name = "Écriture comptable"
        verbose_name_plural = "Écritures comptables"
        db_table = 'comptabilite_financiere_ecriture'
        ordering = ['-date_ecriture', '-numero_ecriture']
        indexes = [
            models.Index(fields=['-date_ecriture']),
            models.Index(fields=['journal']),
            models.Index(fields=['numero_ecriture']),
        ]
    
    def __str__(self):
        return f"{self.numero_ecriture} - {self.libelle}"
    
    @property
    def total_debit(self):
        """Retourne le total des débits."""
        return sum(ligne.montant_debit or 0 for ligne in self.lignes.all())
    
    @property
    def total_credit(self):
        """Retourne le total des crédits."""
        return sum(ligne.montant_credit or 0 for ligne in self.lignes.all())
    
    @property
    def is_equilibree(self):
        """Vérifie si l'écriture est équilibrée (débit = crédit)."""
        return abs(self.total_debit - self.total_credit) < 0.01
    
    @classmethod
    def generer_numero_ecriture(cls):
        """Génère un numéro d'écriture unique."""
        from datetime import datetime
        today = datetime.now()
        prefix = f"EC-{today.year}-"
        
        last_ecriture = cls.objects.filter(
            numero_ecriture__startswith=prefix
        ).order_by('-numero_ecriture').first()
        
        if last_ecriture:
            try:
                last_num = int(last_ecriture.numero_ecriture.split('-')[-1])
                new_num = last_num + 1
            except ValueError:
                new_num = 1
        else:
            new_num = 1
        
        return f"{prefix}{new_num:05d}"


class LigneEcriture(models.Model):
    """
    Modèle pour une ligne d'écriture comptable.
    
    Chaque écriture a au minimum 2 lignes (partie double):
    - Une ligne au débit
    - Une ligne au crédit
    """
    
    ecriture = models.ForeignKey(
        EcritureComptable,
        on_delete=models.CASCADE,
        related_name='lignes',
        verbose_name="Écriture",
        help_text="Écriture parente"
    )
    
    compte = models.ForeignKey(
        'CompteComptable',
        on_delete=models.PROTECT,
        related_name='mouvements',
        verbose_name="Compte",
        help_text="Compte comptable mouvementé"
    )
    
    libelle = models.CharField(
        max_length=255,
        verbose_name="Libellé",
        help_text="Description de la ligne"
    )
    
    montant_debit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Débit",
        help_text="Montant au débit"
    )
    
    montant_credit = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
        verbose_name="Crédit",
        help_text="Montant au crédit"
    )
    
    ordre = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre",
        help_text="Ordre d'affichage de la ligne"
    )
    
    class Meta:
        verbose_name = "Ligne d'écriture"
        verbose_name_plural = "Lignes d'écriture"
        db_table = 'comptabilite_financiere_ligne_ecriture'
        ordering = ['ecriture', 'ordre']
        indexes = [
            models.Index(fields=['compte']),
        ]
    
    def __str__(self):
        if self.montant_debit > 0:
            return f"{self.compte.numero_compte} - Débit: {self.montant_debit}"
        return f"{self.compte.numero_compte} - Crédit: {self.montant_credit}"
    
    def clean(self):
        """Validation: un montant doit être en débit OU en crédit, pas les deux."""
        from django.core.exceptions import ValidationError
        
        if self.montant_debit > 0 and self.montant_credit > 0:
            raise ValidationError(
                "Une ligne ne peut pas avoir à la fois un débit et un crédit."
            )
        if self.montant_debit == 0 and self.montant_credit == 0:
            raise ValidationError(
                "Une ligne doit avoir soit un débit soit un crédit."
            )
