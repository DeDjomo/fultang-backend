from django.db import models

class Rapport(models.Model):
    """Modèle de rapport interne.
    Le statut est initialisé à "non lu" et peut être mis à jour via un endpoint dédié.
    """
    STATUT_CHOICES = [
        ("lu", "Lu"),
        ("non lu", "Non lu"),
    ]
    statut = models.CharField(
        max_length=10,
        choices=STATUT_CHOICES,
        default="non lu",
        verbose_name="Statut du rapport",
    )
    objet = models.CharField(max_length=255, verbose_name="Objet du rapport")
    corps = models.TextField(verbose_name="Corps du rapport")
    date_creation = models.DateTimeField(auto_now_add=True)
    id_personnel = models.ForeignKey(
        "gestion_hospitaliere.Personnel",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Personnel",
        related_name="rapports_materiels"
    )

    class Meta:
        verbose_name = "Rapport"
        verbose_name_plural = "Rapports"
        ordering = ["-date_creation"]
        db_table = "comptabilite_matiere_rapport"

    def __str__(self):
        return f"{self.objet} ({self.statut})"
