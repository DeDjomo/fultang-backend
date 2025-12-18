"""
Modele Service pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.db import models


class Service(models.Model):
    """Modele pour les services de l'hopital."""

    nom_service = models.CharField(max_length=100, unique=True)
    desc_service = models.TextField(blank=True)
    chef_service = models.ForeignKey(
        'Personnel',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='services_diriges'
    )
    date_creation = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['nom_service']
        verbose_name = 'Service'
        verbose_name_plural = 'Services'

    def __str__(self):
        return self.nom_service
