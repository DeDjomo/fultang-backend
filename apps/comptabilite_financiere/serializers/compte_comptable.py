"""
Sérialiseurs pour le modèle CompteComptable.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
from rest_framework import serializers
from apps.comptabilite_financiere.models import CompteComptable


class CompteComptableSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la lecture des comptes comptables."""
    
    sous_comptes_count = serializers.SerializerMethodField()
    classe_display = serializers.CharField(source='get_classe_display', read_only=True)
    type_compte_display = serializers.CharField(source='get_type_compte_display', read_only=True)
    
    class Meta:
        model = CompteComptable
        fields = [
            'id',
            'numero_compte',
            'libelle',
            'classe',
            'classe_display',
            'type_compte',
            'type_compte_display',
            'compte_parent',
            'description',
            'actif',
            'date_creation',
            'sous_comptes_count',
        ]
        read_only_fields = ['id', 'date_creation']
    
    def get_sous_comptes_count(self, obj):
        """Retourne le nombre de sous-comptes."""
        return obj.sous_comptes.count()


class CompteComptableCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'un compte comptable."""
    
    class Meta:
        model = CompteComptable
        fields = [
            'numero_compte',
            'libelle',
            'classe',
            'type_compte',
            'compte_parent',
            'description',
            'actif',
        ]
    
    def validate_numero_compte(self, value):
        """Valider le format du numéro de compte."""
        if not value.isdigit():
            raise serializers.ValidationError(
                "Le numéro de compte doit contenir uniquement des chiffres."
            )
        if len(value) < 1 or len(value) > 10:
            raise serializers.ValidationError(
                "Le numéro de compte doit avoir entre 1 et 10 chiffres."
            )
        return value
    
    def validate(self, attrs):
        """Validation globale."""
        numero = attrs.get('numero_compte', '')
        classe = attrs.get('classe', '')
        
        # Vérifier que le numéro commence par la classe
        if numero and classe and not numero.startswith(classe):
            raise serializers.ValidationError({
                'numero_compte': f"Le numéro de compte doit commencer par {classe} (classe sélectionnée)."
            })
        
        return attrs


class CompteComptableListSerializer(serializers.ModelSerializer):
    """Sérialiseur simplifié pour les listes déroulantes."""
    
    class Meta:
        model = CompteComptable
        fields = ['id', 'numero_compte', 'libelle', 'classe', 'type_compte']
