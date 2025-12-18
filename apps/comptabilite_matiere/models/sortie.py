"""
Modèle Sortie pour l'application comptabilite_matiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from django.db import models
from apps.gestion_hospitaliere.models import Personnel


class Sortie(models.Model):
    """
    Modèle pour gérer les sorties de matériel.
    """
    
    class MotifSortieChoices(models.TextChoices):
        VENTE = 'VENTE', 'Vente'
        UTILISATION_SERVICE = 'UTILISATION_SERVICE', 'Utilisation Service'
        DEFECTUEUX = 'DEFECTUEUX', 'Défectueux'
        PERIME = 'PERIME', 'Périmé'
        PERTE = 'PERTE', 'Perte'
    
    idSortie = models.AutoField(
        primary_key=True,
        verbose_name="Identifiant de la sortie"
    )
    
    numero_sortie = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Numéro de sortie",
        help_text="Numéro de référence unique de la sortie"
    )
    
    date_sortie = models.DateTimeField(
        verbose_name="Date de sortie",
        help_text="Date et heure de la sortie"
    )
    
    motif_sortie = models.CharField(
        max_length=30,
        choices=MotifSortieChoices.choices,
        verbose_name="Motif de sortie",
        help_text="Raison de la sortie du matériel"
    )
    
    idPersonnel = models.ForeignKey(
        Personnel,
        on_delete=models.PROTECT,
        related_name='sorties_effectuees',
        verbose_name="Personnel responsable",
        help_text="Référence vers le personnel ayant effectué la sortie"
    )
    
    class Meta:
        verbose_name = "Sortie"
        verbose_name_plural = "Sorties"
        ordering = ['-date_sortie']
        db_table = 'comptabilite_matiere_sortie'
    
    def __str__(self):
        return f"Sortie #{self.numero_sortie} - {self.get_motif_sortie_display()}"
