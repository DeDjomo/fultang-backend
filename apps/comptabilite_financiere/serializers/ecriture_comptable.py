"""
Sérialiseurs pour les écritures comptables.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
from rest_framework import serializers
from apps.comptabilite_financiere.models import (
    Journal, 
    EcritureComptable, 
    LigneEcriture,
    CompteComptable
)


class JournalSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les journaux comptables."""
    
    compte_contrepartie_info = serializers.SerializerMethodField()
    ecritures_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Journal
        fields = [
            'code',
            'libelle',
            'description',
            'compte_contrepartie',
            'compte_contrepartie_info',
            'actif',
            'ecritures_count',
        ]
    
    def get_compte_contrepartie_info(self, obj):
        if obj.compte_contrepartie:
            return {
                'numero': obj.compte_contrepartie.numero_compte,
                'libelle': obj.compte_contrepartie.libelle,
            }
        return None
    
    def get_ecritures_count(self, obj):
        return obj.ecritures.count()


class LigneEcritureSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les lignes d'écriture."""
    
    compte_numero = serializers.CharField(source='compte.numero_compte', read_only=True)
    compte_libelle = serializers.CharField(source='compte.libelle', read_only=True)
    
    class Meta:
        model = LigneEcriture
        fields = [
            'id',
            'compte',
            'compte_numero',
            'compte_libelle',
            'libelle',
            'montant_debit',
            'montant_credit',
            'ordre',
        ]


class LigneEcritureCreateSerializer(serializers.Serializer):
    """Sérialiseur pour créer des lignes d'écriture."""
    
    compte_id = serializers.IntegerField()
    libelle = serializers.CharField(max_length=255)
    montant_debit = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)
    montant_credit = serializers.DecimalField(max_digits=15, decimal_places=2, default=0)


class EcritureComptableSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour les écritures comptables."""
    
    lignes = LigneEcritureSerializer(many=True, read_only=True)
    journal_libelle = serializers.CharField(source='journal.libelle', read_only=True)
    comptable_nom = serializers.SerializerMethodField()
    quittance_numero = serializers.CharField(source='quittance.numero_quittance', read_only=True)
    total_debit = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_credit = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    is_equilibree = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = EcritureComptable
        fields = [
            'id',
            'numero_ecriture',
            'date_ecriture',
            'journal',
            'journal_libelle',
            'libelle',
            'quittance',
            'quittance_numero',
            'piece_justificative',
            'statut',
            'comptable',
            'comptable_nom',
            'date_creation',
            'date_modification',
            'lignes',
            'total_debit',
            'total_credit',
            'is_equilibree',
        ]
        read_only_fields = ['id', 'numero_ecriture', 'date_creation', 'date_modification']
    
    def get_comptable_nom(self, obj):
        if obj.comptable:
            return f"{obj.comptable.nom} {obj.comptable.prenom}".strip() or obj.comptable.username
        return None


class EcritureComptableCreateSerializer(serializers.Serializer):
    """
    Sérialiseur pour créer une écriture comptable avec ses lignes.
    """
    
    date_ecriture = serializers.DateField()
    journal = serializers.CharField(max_length=10)
    libelle = serializers.CharField(max_length=255)
    piece_justificative = serializers.CharField(max_length=100, required=False, allow_blank=True)
    lignes = LigneEcritureCreateSerializer(many=True)
    
    def validate_journal(self, value):
        """Vérifie que le journal existe."""
        try:
            Journal.objects.get(code=value)
        except Journal.DoesNotExist:
            raise serializers.ValidationError(f"Journal '{value}' non trouvé.")
        return value
    
    def validate_lignes(self, value):
        """Vérifie qu'il y a au moins 2 lignes et que l'écriture est équilibrée."""
        if len(value) < 2:
            raise serializers.ValidationError(
                "Une écriture doit avoir au minimum 2 lignes."
            )
        
        total_debit = sum(l.get('montant_debit', 0) or 0 for l in value)
        total_credit = sum(l.get('montant_credit', 0) or 0 for l in value)
        
        if abs(total_debit - total_credit) > 0.01:
            raise serializers.ValidationError(
                f"L'écriture n'est pas équilibrée. Débit: {total_debit}, Crédit: {total_credit}"
            )
        
        # Vérifier que chaque compte existe
        for ligne in value:
            try:
                CompteComptable.objects.get(id=ligne['compte_id'])
            except CompteComptable.DoesNotExist:
                raise serializers.ValidationError(
                    f"Compte ID {ligne['compte_id']} non trouvé."
                )
        
        return value
    
    def create(self, validated_data):
        """Créer l'écriture et ses lignes."""
        lignes_data = validated_data.pop('lignes')
        journal = Journal.objects.get(code=validated_data['journal'])
        
        # Générer le numéro d'écriture
        numero = EcritureComptable.generer_numero_ecriture()
        
        # Créer l'écriture
        ecriture = EcritureComptable.objects.create(
            numero_ecriture=numero,
            date_ecriture=validated_data['date_ecriture'],
            journal=journal,
            libelle=validated_data['libelle'],
            piece_justificative=validated_data.get('piece_justificative', ''),
            comptable=self.context.get('request').user if self.context.get('request') else None,
            statut='validee',
        )
        
        # Créer les lignes
        for i, ligne_data in enumerate(lignes_data):
            compte = CompteComptable.objects.get(id=ligne_data['compte_id'])
            LigneEcriture.objects.create(
                ecriture=ecriture,
                compte=compte,
                libelle=ligne_data['libelle'],
                montant_debit=ligne_data.get('montant_debit', 0) or 0,
                montant_credit=ligne_data.get('montant_credit', 0) or 0,
                ordre=i,
            )
        
        return ecriture


class GrandLivreSerializer(serializers.Serializer):
    """Sérialiseur pour le Grand Livre (mouvements d'un compte)."""
    
    date_ecriture = serializers.DateField()
    numero_ecriture = serializers.CharField()
    journal = serializers.CharField()
    libelle = serializers.CharField()
    piece = serializers.CharField(allow_null=True)
    debit = serializers.DecimalField(max_digits=15, decimal_places=2)
    credit = serializers.DecimalField(max_digits=15, decimal_places=2)
    solde_cumule = serializers.DecimalField(max_digits=15, decimal_places=2)


class BalanceCompteSerializer(serializers.Serializer):
    """Sérialiseur pour la Balance des comptes."""
    
    compte_id = serializers.IntegerField()
    numero_compte = serializers.CharField()
    libelle = serializers.CharField()
    classe = serializers.CharField()
    total_debit = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_credit = serializers.DecimalField(max_digits=15, decimal_places=2)
    solde_debit = serializers.DecimalField(max_digits=15, decimal_places=2)
    solde_credit = serializers.DecimalField(max_digits=15, decimal_places=2)
