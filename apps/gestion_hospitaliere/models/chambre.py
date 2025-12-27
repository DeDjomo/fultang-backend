"""
Modele Chambre pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models


class Chambre(models.Model):
    """Modele pour les chambres de l'hopital."""

    numero_chambre = models.CharField(max_length=10, unique=True)
    nombre_places_total = models.IntegerField()
    nombre_places_dispo = models.IntegerField()
    tarif_journalier = models.DecimalField(max_digits=10, decimal_places=2)
    service = models.ForeignKey(
        'Service',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chambres',
        verbose_name='Service'
    )

    class Meta:
        ordering = ['numero_chambre']
        verbose_name = 'Chambre'
        verbose_name_plural = 'Chambres'

    def __str__(self):
        service_nom = self.service.nom_service if self.service else "Aucun service"
        return f"Chambre {self.numero_chambre} - {service_nom} ({self.nombre_places_dispo}/{self.nombre_places_total} places)"
