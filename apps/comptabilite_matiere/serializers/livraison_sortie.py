"""
Sérialiseurs pour les modèles Livraison et Sortie.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from rest_framework import serializers
from apps.comptabilite_matiere.models import Livraison, Sortie
from apps.gestion_hospitaliere.models import Personnel


# ======================
# LIVRAISON
# ======================

class LivraisonSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la lecture des livraisons."""
    
    class Meta:
        model = Livraison
        fields = '__all__'
        read_only_fields = ['idLivraison', 'date_creation']


class LivraisonCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'une livraison."""
    
    class Meta:
        model = Livraison
        fields = [
            'bon_livraison_numero',
            'nom_fournisseur',
            'contact_fournisseur',
            'date_reception',
            'montant_total'
        ]
    
    def validate_bon_livraison_numero(self, value):
        """Valider que le numéro de bon n'existe pas déjà."""
        if Livraison.objects.filter(bon_livraison_numero=value).exists():
            raise serializers.ValidationError(
                f"Une livraison avec le bon n°{value} existe déjà."
            )
        return value
    
    def validate_montant_total(self, value):
        """Valider que le montant est positif ou nul."""
        if value < 0:
            raise serializers.ValidationError("Le montant ne peut pas être négatif.")
        return value


class LivraisonUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour d'une livraison."""
    
    class Meta:
        model = Livraison
        fields = [
            'nom_fournisseur',
            'contact_fournisseur',
            'date_reception',
            'montant_total'
        ]
    
    def validate_montant_total(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Le montant ne peut pas être négatif.")
        return value


# ======================
# SORTIE
# ======================

class SortieSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la lecture des sorties."""
    
    motif_sortie_display = serializers.CharField(source='get_motif_sortie_display', read_only=True)
    idPersonnel_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Sortie
        fields = '__all__'
        read_only_fields = ['idSortie']
    
    def get_idPersonnel_details(self, obj):
        """Retourner les détails du personnel."""
        personnel = obj.idPersonnel
        return {
            'id': personnel.id,
            'nom': personnel.nom,
            'prenom': personnel.prenom,
            'matricule': personnel.matricule,
            'email': personnel.email,
            'poste': personnel.poste,
        }


class SortieCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'une sortie."""
    
    idPersonnel = serializers.PrimaryKeyRelatedField(
        queryset=Personnel.objects.all(),
        error_messages={
            'does_not_exist': 'Le personnel avec l\'ID {pk_value} n\'existe pas.',
            'incorrect_type': 'Type incorrect. Attendu un ID (nombre entier).',
        }
    )
    
    class Meta:
        model = Sortie
        fields = [
            'numero_sortie',
            'date_sortie',
            'motif_sortie',
            'idPersonnel'
        ]
    
    def validate_numero_sortie(self, value):
        """Valider que le numéro de sortie n'existe pas déjà."""
        if Sortie.objects.filter(numero_sortie=value).exists():
            raise serializers.ValidationError(
                f"Une sortie avec le numéro {value} existe déjà."
            )
        return value


class SortieUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour d'une sortie."""
    
    class Meta:
        model = Sortie
        fields = [
            'date_sortie',
            'motif_sortie',
            'idPersonnel'
        ]
