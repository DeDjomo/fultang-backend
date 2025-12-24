"""
Modèle PrestationDeService pour l'application comptabilite_financiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-24
"""
from django.db import models


class PrestationDeService(models.Model):
    """
    Modèle pour les prestations de service.
    Clé primaire composite: CodeComptable + ServiceRendu (via Service FK).
    """
    
    code_comptable = models.IntegerField(
        verbose_name="Code Comptable",
        help_text="Code comptable de la prestation"
    )
    
    service_rendu = models.ForeignKey(
        'gestion_hospitaliere.Service',
        on_delete=models.CASCADE,
        related_name='prestations_service',
        verbose_name="Service Rendu",
        help_text="Service associé à cette prestation"
    )
    
    class Meta:
        verbose_name = "Prestation de Service"
        verbose_name_plural = "Prestations de Service"
        ordering = ['code_comptable']
        db_table = 'comptabilite_financiere_prestation_de_service'
        # Clé primaire composite via UniqueConstraint
        constraints = [
            models.UniqueConstraint(
                fields=['code_comptable', 'service_rendu'],
                name='unique_prestation_service'
            )
        ]
        indexes = [
            models.Index(fields=['code_comptable']),
            models.Index(fields=['service_rendu']),
        ]
    
    def __str__(self):
        return f"Prestation {self.code_comptable} - {self.service_rendu}"
    
    @property
    def cle_primaire_composite(self):
        """Retourne la clé primaire composite sous forme de chaîne."""
        return f"{self.code_comptable}_{self.service_rendu_id}"
