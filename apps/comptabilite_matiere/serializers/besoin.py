"""
Sérialiseurs pour l'application comptabilite_matiere.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from rest_framework import serializers
from apps.comptabilite_matiere.models import Besoin
from apps.gestion_hospitaliere.models import Personnel


class BesoinCreateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la création d'un besoin.
    
    Accepte uniquement le motif et l'idPersonnel_emetteur.
    Le statut est automatiquement mis à EN_COURS et la date de création
    est automatiquement définie.
    """
    
    idPersonnel_emetteur = serializers.PrimaryKeyRelatedField(
        queryset=Personnel.objects.all(),
        error_messages={
            'does_not_exist': 'Le personnel avec l\'ID {pk_value} n\'existe pas. Utilisez /api/gestion-hospitaliere/personnels/ pour voir les IDs disponibles.',
            'incorrect_type': 'Type incorrect. Attendu un ID (nombre entier).',
        }
    )
    
    class Meta:
        model = Besoin
        fields = ['motif', 'idPersonnel_emetteur']
    
    def create(self, validated_data):
        """
        Créer un besoin avec le statut EN_COURS par défaut.
        """
        # Le statut EN_COURS est déjà défini par défaut dans le modèle
        # La date de création est aussi automatique
        return Besoin.objects.create(**validated_data)



class BesoinSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour la lecture des besoins.
    
    Inclut tous les champs et des informations détaillées sur le personnel émetteur.
    """
    
    idPersonnel_emetteur_details = serializers.SerializerMethodField()
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    
    class Meta:
        model = Besoin
        fields = [
            'idBesoin',
            'date_creation_besoin',
            'idPersonnel_emetteur',
            'idPersonnel_emetteur_details',
            'motif',
            'statut',
            'statut_display',
            'date_traitement_directeur',
            'commentaire_directeur',
        ]
        read_only_fields = [
            'idBesoin',
            'date_creation_besoin',
            'date_traitement_directeur',
        ]
    
    def get_idPersonnel_emetteur_details(self, obj):
        """Retourner des informations sur le personnel émetteur."""
        personnel = obj.idPersonnel_emetteur
        return {
            'id': personnel.id,
            'nom': personnel.nom,
            'prenom': personnel.prenom,
            'matricule': personnel.matricule,
            'email': personnel.email,
        }


class BesoinUpdateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la mise à jour d'un besoin (principalement pour le directeur).
    
    Permet de modifier le statut, le commentaire du directeur.
    """
    
    class Meta:
        model = Besoin
        fields = [
            'statut',
            'commentaire_directeur',
        ]
    
    def validate_statut(self, value):
        """Valider le changement de statut."""
        if value not in dict(Besoin.StatutChoices.choices):
            raise serializers.ValidationError(f"Statut invalide: {value}")
        return value


class CommentaireDirecteurSerializer(serializers.Serializer):
    """
    Sérialiseur pour ajouter le commentaire du directeur.
    
    La date de traitement est automatiquement définie lors de l'ajout du commentaire.
    """
    
    commentaire_directeur = serializers.CharField(
        required=True,
        allow_blank=False,
        min_length=5,
        max_length=1000,
        error_messages={
            'required': 'Le commentaire du directeur est requis.',
            'blank': 'Le commentaire ne peut pas être vide.',
            'min_length': 'Le commentaire doit contenir au moins 5 caractères.',
            'max_length': 'Le commentaire ne peut pas dépasser 1000 caractères.',
        }
    )
    
    def validate_commentaire_directeur(self, value):
        """Validation supplémentaire du commentaire."""
        if not value or not value.strip():
            raise serializers.ValidationError("Le commentaire ne peut pas être vide ou contenir uniquement des espaces.")
        return value.strip()
    
    def update(self, instance, validated_data):
        """
        Met à jour le besoin avec le commentaire et la date de traitement.
        """
        from django.utils import timezone
        
        instance.commentaire_directeur = validated_data['commentaire_directeur']
        instance.date_traitement_directeur = timezone.now()
        instance.save(update_fields=['commentaire_directeur', 'date_traitement_directeur'])
        return instance


class ModifierStatutSerializer(serializers.Serializer):
    """
    Sérialiseur pour modifier uniquement le statut d'un besoin.
    
    La date de traitement est automatiquement mise à jour si le statut
    passe à TRAITE ou REJETE.
    """
    
    statut = serializers.ChoiceField(
        choices=Besoin.StatutChoices.choices,
        required=True,
        error_messages={
            'required': 'Le statut est requis.',
            'invalid_choice': 'Statut invalide. Valeurs autorisées : NON_TRAITE, EN_COURS, TRAITE, REJETE.'
        }
    )
    
    def validate_statut(self, value):
        """Validation supplémentaire du statut."""
        instance = self.instance
        
        # Vérifier que le statut change vraiment
        if instance and instance.statut == value:
            raise serializers.ValidationError(f"Le besoin a déjà le statut '{instance.get_statut_display()}'.")
        
        return value
    
    def update(self, instance, validated_data):
        """
        Met à jour le statut du besoin.
        
        Si le statut devient TRAITE ou REJETE, la date de traitement
        est automatiquement définie (logique dans le modèle).
        """
        instance.statut = validated_data['statut']
        instance.save(update_fields=['statut', 'date_traitement_directeur'])
        return instance
