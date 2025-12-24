"""
Sérialiseurs pour PrestationDeService.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-24
"""
from rest_framework import serializers
from apps.comptabilite_financiere.models import PrestationDeService
from apps.gestion_hospitaliere.models import Service


class PrestationDeServiceSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la lecture des prestations de service."""
    
    service_rendu_detail = serializers.SerializerMethodField()
    cle_primaire_composite = serializers.ReadOnlyField()
    
    class Meta:
        model = PrestationDeService
        fields = [
            'id',
            'code_comptable',
            'service_rendu',
            'service_rendu_detail',
            'cle_primaire_composite',
        ]
        read_only_fields = ['id', 'cle_primaire_composite']
    
    def get_service_rendu_detail(self, obj):
        """Retourne les détails du service rendu."""
        if obj.service_rendu:
            return {
                'id': obj.service_rendu.id,
                'nom_service': obj.service_rendu.nom_service,
                'desc_service': obj.service_rendu.desc_service,
            }
        return None


class PrestationDeServiceCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création de prestations de service."""
    
    class Meta:
        model = PrestationDeService
        fields = ['code_comptable', 'service_rendu']
    
    def validate(self, data):
        """Vérifie que la combinaison code_comptable + service_rendu est unique."""
        code_comptable = data.get('code_comptable')
        service_rendu = data.get('service_rendu')
        
        if PrestationDeService.objects.filter(
            code_comptable=code_comptable,
            service_rendu=service_rendu
        ).exists():
            raise serializers.ValidationError(
                "Une prestation avec ce code comptable et ce service existe déjà."
            )
        
        return data


class PrestationDeServiceUpdateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour de prestations de service."""
    
    class Meta:
        model = PrestationDeService
        fields = ['code_comptable', 'service_rendu']
    
    def validate(self, data):
        """Vérifie que la combinaison code_comptable + service_rendu est unique."""
        instance = self.instance
        code_comptable = data.get('code_comptable', instance.code_comptable)
        service_rendu = data.get('service_rendu', instance.service_rendu)
        
        if PrestationDeService.objects.filter(
            code_comptable=code_comptable,
            service_rendu=service_rendu
        ).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError(
                "Une prestation avec ce code comptable et ce service existe déjà."
            )
        
        return data
