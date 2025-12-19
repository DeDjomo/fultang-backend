"""
Configuration de l'admin Django pour comptabilite_financiere.
"""
from django.contrib import admin
from apps.comptabilite_financiere.models import Quittance


@admin.register(Quittance)
class QuittanceAdmin(admin.ModelAdmin):
    """Configuration admin pour Quittance."""
    
    list_display = [
        'idQuittance',
        'numero_quittance',
        'date_paiement',
        'Montant_paye',
        'motif_court',
    ]
    
    list_filter = ['date_paiement']
    search_fields = ['numero_quittance', 'Motif']
    readonly_fields = ['idQuittance']
    ordering = ['-date_paiement']
    
    fieldsets = [
        ('Quittance', {
            'fields': ['idQuittance', 'numero_quittance', 'date_paiement']
        }),
        ('Paiement', {
            'fields': ['Montant_paye', 'Motif']
        }),
    ]
    
    def motif_court(self, obj):
        """Afficher un aperçu court du motif."""
        return obj.Motif[:50] + '...' if len(obj.Motif) > 50 else obj.Motif
    
    motif_court.short_description = 'Motif'
