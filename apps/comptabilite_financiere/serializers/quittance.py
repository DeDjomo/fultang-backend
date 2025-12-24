"""
Sérialiseurs pour le modèle Quittance.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from rest_framework import serializers
from apps.comptabilite_financiere.models import Quittance


class QuittanceSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la lecture des quittances."""
    
    class Meta:
        model = Quittance
        fields = '__all__'
        read_only_fields = ['idQuittance']


class QuittanceCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'une quittance."""
    
    class Meta:
        model = Quittance
        fields = [
            'numero_quittance',
            'date_paiement',
            'Montant_paye',
            'Motif',
            'id_session'
        ]
    
    def validate_numero_quittance(self, value):
        """Valider que le numéro de quittance n'existe pas déjà."""
        if Quittance.objects.filter(numero_quittance=value).exists():
            raise serializers.ValidationError(
                f"Une quittance avec le numéro {value} existe déjà."
            )
        return value
    
    def validate_Montant_paye(self, value):
        """Valider que le montant est positif."""
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value
    
    def validate_Motif(self, value):
        """Valider que le motif n'est pas vide."""
        if not value or not value.strip():
            raise serializers.ValidationError("Le motif ne peut pas être vide.")
        return value.strip()


class QuittanceUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour d'une quittance."""
    
    class Meta:
        model = Quittance
        fields = [
            'date_paiement',
            'Montant_paye',
            'Motif',
            'id_session'
        ]
    
    def validate_Montant_paye(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value
