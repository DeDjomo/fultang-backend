from django.db import models
from .livraison import Livraison
from .materiel import Materiel

class LigneLivraison(models.Model):
    """Une ligne détaillant le contenu d'une livraison.
    Elle lie un matériel (médical ou durable) à une livraison.
    """
    TYPE_CHOICES = [
        ("MEDICAL", "Medical"),
        ("DURABLE", "Durable"),
    ]
    id_livraison = models.ForeignKey(
        Livraison,
        on_delete=models.CASCADE,
        related_name="lignes",
        verbose_name="Livraison",
    )
    type_materiel = models.CharField(
        max_length=7,
        choices=TYPE_CHOICES,
        verbose_name="Type de matériel",
    )
    materiel = models.ForeignKey(
        Materiel,
        on_delete=models.PROTECT,
        verbose_name="Matériel",
    )
    quantite_conforme = models.PositiveIntegerField(default=0)
    quantite_non_conforme = models.PositiveIntegerField(default=0)
    prix_unitaire_achat = models.DecimalField(max_digits=10, decimal_places=2)
    date_peremption = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = "Ligne de livraison"
        verbose_name_plural = "Lignes de livraison"
        db_table = "comptabilite_matiere_ligne_livraison"

    def __str__(self):
        return f"{self.materiel} - {self.quantite_conforme}+{self.quantite_non_conforme}"
