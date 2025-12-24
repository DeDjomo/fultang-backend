"""
Sérialiseurs pour le modèle Cheque.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-23
"""
from rest_framework import serializers
from apps.comptabilite_financiere.models import Cheque


class ChequeSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour le modèle Cheque."""
    
    patient_nom = serializers.CharField(source='patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='patient.prenom', read_only=True)
    patient_matricule = serializers.CharField(source='patient.matricule', read_only=True)
    est_encaisse = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Cheque
        fields = [
            'numero_cheque',
            'date_emission',
            'montant',
            'date_encaissement',
            'patient',
            'patient_nom',
            'patient_prenom',
            'patient_matricule',
            'est_encaisse',
        ]
        read_only_fields = ['numero_cheque', 'date_emission', 'est_encaisse']


class ChequeCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'un chèque."""
    
    class Meta:
        model = Cheque
        fields = ['montant', 'patient']
    
    def validate_montant(self, value):
        if value <= 0:
            raise serializers.ValidationError("Le montant doit être supérieur à 0.")
        return value


class ChequeEncaissementSerializer(serializers.Serializer):
    """Sérialiseur pour l'encaissement d'un chèque."""
    
    date_encaissement = serializers.DateTimeField(required=False, allow_null=True)
    
    def validate(self, attrs):
        if 'date_encaissement' not in attrs or attrs['date_encaissement'] is None:
            from django.utils import timezone
            attrs['date_encaissement'] = timezone.now()
        return attrs
