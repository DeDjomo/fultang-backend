"""
Configuration de l'admin Django pour comptabilite_matiere.
"""
from django.contrib import admin
from apps.comptabilite_matiere.models import (
    Besoin,
    Materiel,
    MaterielMedical,
    MaterielDurable,
    Livraison,
    Sortie,
)


@admin.register(Besoin)
class BesoinAdmin(admin.ModelAdmin):
    """
    Configuration de l'interface d'administration pour le modèle Besoin.
    """
    
    list_display = [
        'idBesoin',
        'motif_court',
        'idPersonnel_emetteur',
        'statut',
        'date_creation_besoin',
        'date_traitement_directeur',
    ]
    
    list_filter = [
        'statut',
        'date_creation_besoin',
        'date_traitement_directeur',
    ]
    
    search_fields = [
        'motif',
        'commentaire_directeur',
        'idPersonnel_emetteur__nom',
        'idPersonnel_emetteur__prenom',
        'idPersonnel_emetteur__matricule',
    ]
    
    readonly_fields = [
        'idBesoin',
        'date_creation_besoin',
    ]
    
    fieldsets = [
        ('Informations générales', {
            'fields': [
                'idBesoin',
                'date_creation_besoin',
                'idPersonnel_emetteur',
                'motif',
            ]
        }),
        ('Traitement', {
            'fields': [
                'statut',
                'date_traitement_directeur',
                'commentaire_directeur',
            ]
        }),
    ]
    
    ordering = ['-date_creation_besoin']
    
    def motif_court(self, obj):
        """Afficher un aperçu court du motif."""
        return obj.motif[:50] + '...' if len(obj.motif) > 50 else obj.motif
    
    motif_court.short_description = 'Motif'


@admin.register(Materiel)
class MaterielAdmin(admin.ModelAdmin):
    """Configuration admin pour Materiel."""
    
    list_display = [
        'idMateriel',
        'nom_Materiel',
        'prix_achat_unitaire',
        'quantite_stock',
        'date_derniere_modification',
    ]
    
    list_filter = ['date_derniere_modification']
    search_fields = ['nom_Materiel']
    readonly_fields = ['idMateriel', 'date_derniere_modification']
    ordering = ['nom_Materiel']


@admin.register(MaterielMedical)
class MaterielMedicalAdmin(admin.ModelAdmin):
    """Configuration admin pour MaterielMedical."""
    
    list_display = [
        'idMateriel',
        'nom_Materiel',
        'categorie',
        'unite_mesure',
        'prix_achat_unitaire',
        'prix_vente_unitaire',
        'quantite_stock',
    ]
    
    list_filter = ['categorie', 'unite_mesure']
    search_fields = ['nom_Materiel']
    readonly_fields = ['idMateriel', 'date_derniere_modification']
    ordering = ['nom_Materiel']
    
    fieldsets = [
        ('Informations de base', {
            'fields': ['idMateriel', 'nom_Materiel', 'quantite_stock', 'date_derniere_modification']
        }),
        ('Classification', {
            'fields': ['categorie', 'unite_mesure']
        }),
        ('Tarification', {
            'fields': ['prix_achat_unitaire', 'prix_vente_unitaire']
        }),
    ]


@admin.register(MaterielDurable)
class MaterielDurableAdmin(admin.ModelAdmin):
    """Configuration admin pour MaterielDurable."""
    
    list_display = [
        'idMateriel',
        'nom_Materiel',
        'Etat',
        'localisation',
        'quantite_stock',
        'date_Enregistrement',
    ]
    
    list_filter = ['Etat', 'localisation', 'date_Enregistrement']
    search_fields = ['nom_Materiel', 'localisation']
    readonly_fields = ['idMateriel', 'date_derniere_modification', 'date_Enregistrement']
    ordering = ['nom_Materiel']
    
    fieldsets = [
        ('Informations de base', {
            'fields': ['idMateriel', 'nom_Materiel', 'quantite_stock', 'prix_achat_unitaire']
        }),
        ('État et localisation', {
            'fields': ['Etat', 'localisation']
        }),
        ('Dates', {
            'fields': ['date_Enregistrement', 'date_derniere_modification']
        }),
    ]


@admin.register(Livraison)
class LivraisonAdmin(admin.ModelAdmin):
    """Configuration admin pour Livraison."""
    
    list_display = [
        'idLivraison',
        'bon_livraison_numero',
        'nom_fournisseur',
        'contact_fournisseur',
        'date_reception',
        'montant_total',
    ]
    
    list_filter = ['date_reception', 'nom_fournisseur']
    search_fields = ['bon_livraison_numero', 'nom_fournisseur', 'contact_fournisseur']
    readonly_fields = ['idLivraison', 'date_creation']
    ordering = ['-date_reception']
    
    fieldsets = [
        ('Bon de livraison', {
            'fields': ['idLivraison', 'bon_livraison_numero']
        }),
        ('Fournisseur', {
            'fields': ['nom_fournisseur', 'contact_fournisseur']
        }),
        ('Détails', {
            'fields': ['date_reception', 'montant_total']
        }),
        ('Métadonnées', {
            'fields': ['date_creation']
        }),
    ]


@admin.register(Sortie)
class SortieAdmin(admin.ModelAdmin):
    """Configuration admin pour Sortie."""
    
    list_display = [
        'idSortie',
        'numero_sortie',
        'date_sortie',
        'motif_sortie',
        'idPersonnel',
    ]
    
    list_filter = ['motif_sortie', 'date_sortie']
    search_fields = ['numero_sortie', 'idPersonnel__nom', 'idPersonnel__prenom']
    readonly_fields = ['idSortie']
    ordering = ['-date_sortie']
    
    fieldsets = [
        ('Sortie', {
            'fields': ['idSortie', 'numero_sortie', 'date_sortie']
        }),
        ('Motif', {
            'fields': ['motif_sortie']
        }),
        ('Responsable', {
            'fields': ['idPersonnel']
        }),
    ]

