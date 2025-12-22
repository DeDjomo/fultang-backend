"""
Serializers pour le modele Session.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-19
"""
from rest_framework import serializers
from apps.suivi_patient.models import Session, Patient
from apps.gestion_hospitaliere.models import Personnel


class SessionSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des sessions."""

    patient_nom = serializers.CharField(source='id_patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='id_patient.prenom', read_only=True)
    patient_matricule = serializers.CharField(source='id_patient.matricule', read_only=True)
    personnel_nom = serializers.CharField(source='id_personnel.nom', read_only=True)
    personnel_prenom = serializers.CharField(source='id_personnel.prenom', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    situation_display = serializers.CharField(source='get_situation_patient_display', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'debut', 'fin', 'id_patient', 'id_personnel',
            'service_courant', 'personnel_responsable', 'statut', 'situation_patient',
            'patient_nom', 'patient_prenom', 'patient_matricule',
            'personnel_nom', 'personnel_prenom', 'statut_display', 'situation_display'
        ]
        read_only_fields = ['id', 'debut']


class SessionCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'une session.
    
    Champs obligatoires: id_patient, id_service
    Champs optionnels: id_personnel (si non fourni, utilise l'utilisateur connecte)
    """

    id_patient = serializers.IntegerField(help_text="ID du patient")
    id_service = serializers.IntegerField(help_text="ID du service")
    id_personnel = serializers.IntegerField(
        required=False, 
        allow_null=True,
        help_text="ID du personnel qui ouvre la session (optionnel si connecte en tant que Personnel)"
    )

    def validate_id_patient(self, value):
        """Verifie que le patient existe."""
        if not Patient.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun patient trouve avec l\'ID {value}.'
            )
        return value

    def validate_id_service(self, value):
        """Verifie que le service existe."""
        from apps.gestion_hospitaliere.models import Service
        if not Service.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun service trouve avec l\'ID {value}.'
            )
        return value

    def validate_id_personnel(self, value):
        """Verifie que le personnel existe si fourni."""
        if value is not None:
            if not Personnel.objects.filter(id=value).exists():
                raise serializers.ValidationError(
                    f'Aucun personnel trouve avec l\'ID {value}.'
                )
        return value


class SessionUpdateSerializer(serializers.Serializer):
    """Serializer pour la mise a jour d'une session."""

    statut = serializers.ChoiceField(
        choices=['en attente', 'en cours', 'terminee'],
        required=False
    )
    situation_patient = serializers.ChoiceField(
        choices=['en attente', 'recu'],
        required=False
    )
    fin = serializers.DateTimeField(required=False, allow_null=True)
