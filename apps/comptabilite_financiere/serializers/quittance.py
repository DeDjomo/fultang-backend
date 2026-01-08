"""
Sérialiseurs pour le modèle Quittance.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-18
"""
from rest_framework import serializers
from apps.comptabilite_financiere.models import (
    Quittance, Cheque, PaiementMobile, VirementBancaire, PaiementCarte
)
from django.db import transaction


class QuittanceSerializer(serializers.ModelSerializer):
    """Sérialiseur complet pour la lecture des quittances."""
    
    # Patient info via Session
    patient_nom = serializers.SerializerMethodField()
    patient_prenom = serializers.SerializerMethodField()
    patient_matricule = serializers.SerializerMethodField()
    patient_full_name = serializers.SerializerMethodField()
    
    # Session info
    session_info = serializers.SerializerMethodField()
    
    # Caissier and Comptable names
    caissier_nom = serializers.SerializerMethodField()
    comptable_nom = serializers.SerializerMethodField()
    
    # Compte comptable info
    compte_comptable_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Quittance
        fields = [
            'idQuittance',
            'numero_quittance',
            'date_paiement',
            'Montant_paye',
            'Motif',
            'type_recette',
            'mode_paiement',
            'validee',
            'id_session',
            'caissier',
            'compte_comptable_id',
            'piece_recette_id',
            'date_affectation_compte',
            'id_comptable_affectation',
            # Additional computed fields
            'patient_nom',
            'patient_prenom',
            'patient_matricule',
            'patient_full_name',
            'session_info',
            'caissier_nom',
            'comptable_nom',
            'compte_comptable_info',
        ]
        read_only_fields = ['idQuittance']
    
    def get_patient_nom(self, obj):
        """Récupérer le nom du patient via la session."""
        if obj.id_session and obj.id_session.id_patient:
            return obj.id_session.id_patient.nom
        return None
    
    def get_patient_prenom(self, obj):
        """Récupérer le prénom du patient via la session."""
        if obj.id_session and obj.id_session.id_patient:
            return obj.id_session.id_patient.prenom
        return None
    
    def get_patient_matricule(self, obj):
        """Récupérer le matricule du patient via la session."""
        if obj.id_session and obj.id_session.id_patient:
            return obj.id_session.id_patient.matricule
        return None
    
    def get_patient_full_name(self, obj):
        """Récupérer le nom complet du patient."""
        if obj.id_session and obj.id_session.id_patient:
            patient = obj.id_session.id_patient
            return f"{patient.nom} {patient.prenom}".strip()
        return "Patient inconnu"
    
    def get_session_info(self, obj):
        """Récupérer les infos de session."""
        if obj.id_session:
            return {
                'id': obj.id_session.id,
                'service': obj.id_session.service_courant,
                'statut': obj.id_session.statut,
                'debut': obj.id_session.debut,
            }
        return None
    
    def get_caissier_nom(self, obj):
        """Récupérer le nom du caissier."""
        if obj.caissier:
            return f"{obj.caissier.nom} {obj.caissier.prenom}".strip() or obj.caissier.username
        return None
    
    def get_comptable_nom(self, obj):
        """Récupérer le nom du comptable qui a validé."""
        if obj.id_comptable_affectation:
            return f"{obj.id_comptable_affectation.nom} {obj.id_comptable_affectation.prenom}".strip() or obj.id_comptable_affectation.username
        return None
    
    def get_compte_comptable_info(self, obj):
        """Récupérer les infos du compte comptable."""
        if obj.compte_comptable_id:
            from apps.comptabilite_financiere.models import CompteComptable
            try:
                compte = CompteComptable.objects.get(id=obj.compte_comptable_id)
                return {
                    'id': compte.id,
                    'numero': compte.numero_compte,
                    'libelle': compte.libelle,
                }
            except CompteComptable.DoesNotExist:
                return None
        return None



class QuittanceCreateSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'une quittance."""
    
    # Make these optional with defaults for the cashier
    type_recette = serializers.CharField(default='soins', required=False)
    mode_paiement = serializers.CharField(default='especes', required=False)
    validee = serializers.BooleanField(default=False, required=False)
    
    class Meta:
        model = Quittance
        fields = [
            'numero_quittance',
            'date_paiement',
            'Montant_paye',
            'Motif',
            'id_session',
            'type_recette',
            'mode_paiement',
            'validee',
            # Cheque fields (write-only)
            'cheque_numero',
            'cheque_banque',
            'cheque_titulaire',
            # Mobile Money fields (write-only)
            'mobile_numero',
            'mobile_operateur',
            'mobile_reference',
            # Virement fields (write-only)
            'virement_banque',
            'virement_reference',
            'virement_date',
            'virement_compte',
            # Carte fields (write-only)
            'carte_numero',
            'carte_reference',
            'carte_terminal',
        ]
        read_only_fields = ['numero_quittance']
        
    cheque_numero = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cheque_banque = serializers.CharField(write_only=True, required=False, allow_blank=True)
    cheque_titulaire = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    mobile_numero = serializers.CharField(write_only=True, required=False, allow_blank=True)
    mobile_operateur = serializers.CharField(write_only=True, required=False, allow_blank=True)
    mobile_reference = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    virement_banque = serializers.CharField(write_only=True, required=False, allow_blank=True)
    virement_reference = serializers.CharField(write_only=True, required=False, allow_blank=True)
    virement_date = serializers.DateField(write_only=True, required=False, allow_null=True)
    virement_compte = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    carte_numero = serializers.CharField(write_only=True, required=False, allow_blank=True)
    carte_reference = serializers.CharField(write_only=True, required=False, allow_blank=True)
    carte_terminal = serializers.CharField(write_only=True, required=False, allow_blank=True)

    
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
    
    def validate_id_session(self, value):
        """Valider que la session existe si fournie."""
        # Convertir les valeurs vides en None
        if value == '' or value is None:
            return None
        return value
    
    def validate(self, attrs):
        """Validation globale des données."""
        # Si id_session est vide ou None, c'est OK (le champ est optional)
        id_session = attrs.get('id_session')
        if id_session == '':
            attrs['id_session'] = None
        
        # Auto-determine type_recette from session.service_courant if session exists
        if id_session and id_session != '' and attrs.get('type_recette') in [None, '', 'soins']:
            try:
                service = id_session.service_courant.lower() if hasattr(id_session, 'service_courant') else ''
                
                # Mapping service_courant -> type_recette
                service_type_mapping = {
                    'consultation': 'consultation',
                    'medecin': 'consultation',
                    'generaliste': 'consultation',
                    'soins': 'soins',
                    'infirmier': 'soins',
                    'infirmerie': 'soins',
                    'laboratoire': 'examens',
                    'labo': 'examens',
                    'examens': 'examens',
                    'radiologie': 'examens',
                    'pharmacie': 'pharmacie',
                    'medicaments': 'pharmacie',
                    'hospitalisation': 'hospitalisation',
                    'urgences': 'urgences',
                    'urgence': 'urgences',
                }
                
                # Find matching type from service name
                type_found = 'autre'
                for key, value in service_type_mapping.items():
                    if key in service:
                        type_found = value
                        break
                
                attrs['type_recette'] = type_found
            except Exception:
                attrs['type_recette'] = 'soins'
        
        # Set defaults for required fields if not provided
        if 'type_recette' not in attrs or not attrs['type_recette']:
            attrs['type_recette'] = 'soins'
        if 'mode_paiement' not in attrs:
            attrs['mode_paiement'] = 'especes'
        if 'validee' not in attrs:
            attrs['validee'] = False
            
        return attrs

    def create(self, validated_data):
        """Créer une quittance et éventuellement un chèque associé."""
        # Extract cheque data
        cheque_numero = validated_data.pop('cheque_numero', '')
        cheque_banque = validated_data.pop('cheque_banque', '')
        cheque_titulaire = validated_data.pop('cheque_titulaire', '')
        
        # Extract mobile money data
        mobile_numero = validated_data.pop('mobile_numero', '')
        mobile_operateur = validated_data.pop('mobile_operateur', 'orange')
        mobile_reference = validated_data.pop('mobile_reference', '')
        
        # Extract virement data
        virement_banque = validated_data.pop('virement_banque', '')
        virement_reference = validated_data.pop('virement_reference', '')
        virement_date = validated_data.pop('virement_date', None)
        virement_compte = validated_data.pop('virement_compte', '')
        
        # Extract carte data
        carte_numero = validated_data.pop('carte_numero', '')
        carte_reference = validated_data.pop('carte_reference', '')
        carte_terminal = validated_data.pop('carte_terminal', '')
        
        with transaction.atomic():
            # Create the quittance
            quittance = Quittance.objects.create(**validated_data)
            
            # If payment mode is cheque and we have data, create cheque
            if quittance.mode_paiement == 'cheque' and cheque_numero:
                # Get patient from session if available
                patient = None
                if quittance.id_session and quittance.id_session.id_patient:
                    patient = quittance.id_session.id_patient
                
                if patient:
                    Cheque.objects.create(
                        numero_cheque_externe=cheque_numero,
                        nom_banque=cheque_banque,
                        nom_titulaire=cheque_titulaire,
                        montant=quittance.Montant_paye,
                        date_emission=quittance.date_paiement,
                        patient=patient,
                        quittance=quittance
                    )
            
            # Mobile Money
            elif quittance.mode_paiement == 'mobile_money':
                if mobile_numero:
                    PaiementMobile.objects.create(
                        numero_payant=mobile_numero,
                        operateur=mobile_operateur,
                        reference_transaction=mobile_reference,
                        quittance=quittance
                    )
            
            # Virement Bancaire
            elif quittance.mode_paiement == 'virement':
                if virement_banque:
                    VirementBancaire.objects.create(
                        banque_emettrice=virement_banque,
                        reference_virement=virement_reference,
                        date_virement=virement_date or quittance.date_paiement,
                        compte_source=virement_compte,
                        quittance=quittance
                    )

            # Carte Bancaire
            elif quittance.mode_paiement == 'carte':
                if carte_numero:
                    PaiementCarte.objects.create(
                        numero_carte_masque=carte_numero,
                        reference_transaction=carte_reference,
                        terminal_id=carte_terminal,
                        quittance=quittance
                    )
            
            return quittance

    def to_representation(self, instance):
        """Utiliser le sérialiseur complet pour la réponse."""
        return QuittanceSerializer(instance).data


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
