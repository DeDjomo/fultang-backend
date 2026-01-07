"""
Serializers pour le modèle Rapport.
"""
from rest_framework import serializers
from apps.comptabilite_matiere.models import Rapport, PieceJointeRapport


class PieceJointeRapportNestedSerializer(serializers.ModelSerializer):
    """Serializer pour les pièces jointes dans un rapport."""
    
    type_piece_display = serializers.CharField(
        source='get_type_piece_display',
        read_only=True
    )
    
    class Meta:
        model = PieceJointeRapport
        fields = [
            'id_piece_jointe',
            'type_piece',
            'type_piece_display',
            'nom_fichier',
            'chemin_fichier',
            'donnees_json',
            'created_at',
        ]
        read_only_fields = ['id_piece_jointe', 'created_at']


class RapportSerializer(serializers.ModelSerializer):
    """Serializer pour le modèle Rapport."""
    
    type_rapport_display = serializers.CharField(
        source='get_type_rapport_display',
        read_only=True
    )
    expediteur_nom = serializers.SerializerMethodField()
    destinataire_nom = serializers.SerializerMethodField()
    pieces_jointes = PieceJointeRapportNestedSerializer(many=True, read_only=True)
    
    class Meta:
        model = Rapport
        fields = [
            'id',
            'code_rapport',
            'objet',
            'corps',
            'statut',
            'id_personnel',
            'expediteur',
            'expediteur_nom',
            'destinataire',
            'destinataire_nom',
            'date_creation',
            'date_envoi',
            'date_lecture',
            'est_lu',
            'type_rapport',
            'type_rapport_display',
            'archive_associee',
            'pieces_jointes',
        ]
        read_only_fields = ['id', 'date_creation', 'date_lecture']
    
    def get_expediteur_nom(self, obj):
        if obj.expediteur:
            return obj.expediteur.get_full_name() if hasattr(obj.expediteur, 'get_full_name') else str(obj.expediteur)
        return None
    
    def get_destinataire_nom(self, obj):
        if obj.destinataire:
            return obj.destinataire.get_full_name() if hasattr(obj.destinataire, 'get_full_name') else str(obj.destinataire)
        return None


class RapportCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de Rapport."""
    
    class Meta:
        model = Rapport
        fields = [
            'code_rapport',
            'objet',
            'corps',
            'id_personnel',
            'expediteur',
            'destinataire',
            'type_rapport',
            'archive_associee',
        ]


class RapportMarkReadSerializer(serializers.Serializer):
    """Serializer pour marquer un rapport comme lu."""
    pass  # Pas de champs nécessaires, l'action est automatique
