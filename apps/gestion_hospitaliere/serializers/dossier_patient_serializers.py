"""
Serializers pour le modele DossierPatient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import serializers
from apps.suivi_patient.models import DossierPatient, Patient


class DossierPatientSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des dossiers patients."""

    patient_nom = serializers.CharField(source='id_patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='id_patient.prenom', read_only=True)
    patient_matricule = serializers.CharField(source='id_patient.matricule', read_only=True)
    patient_date_naissance = serializers.DateField(source='id_patient.date_naissance', read_only=True)

    class Meta:
        model = DossierPatient
        fields = [
            'id_patient', 'groupe_sanguin', 'facteur_rhesus', 'poids', 'taille',
            'allergies', 'antecedents',
            'patient_nom', 'patient_prenom', 'patient_matricule', 'patient_date_naissance'
        ]


class DossierPatientCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'un dossier patient.

    Champs obligatoires:
    - id_patient

    Champs optionnels:
    - groupe_sanguin, facteur_rhesus, poids, taille, allergies, antecedents
    """

    id_patient = serializers.IntegerField()
    groupe_sanguin = serializers.ChoiceField(
        choices=DossierPatient.GROUPE_SANGUIN_CHOICES,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    facteur_rhesus = serializers.ChoiceField(
        choices=DossierPatient.FACTEUR_RHESUS_CHOICES,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    poids = serializers.FloatField(required=False, allow_null=True, min_value=0.1)
    taille = serializers.FloatField(required=False, allow_null=True, min_value=0.1)
    allergies = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    antecedents = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def validate_id_patient(self, value):
        """Verifie que le patient existe."""
        if not Patient.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Patient avec ID {value} n\'existe pas.'
            )

        # Verifier qu'un dossier n'existe pas deja pour ce patient
        if DossierPatient.objects.filter(id_patient=value).exists():
            raise serializers.ValidationError(
                f'Un dossier existe deja pour ce patient.'
            )

        return value

    def create(self, validated_data):
        """Cree un nouveau dossier patient."""
        id_patient = validated_data.pop('id_patient')

        dossier = DossierPatient.objects.create(
            id_patient_id=id_patient,
            **validated_data
        )
        return dossier


class DossierPatientUpdateSerializer(serializers.Serializer):
    """Serializer pour la mise a jour d'un dossier patient."""

    groupe_sanguin = serializers.ChoiceField(
        choices=DossierPatient.GROUPE_SANGUIN_CHOICES,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    facteur_rhesus = serializers.ChoiceField(
        choices=DossierPatient.FACTEUR_RHESUS_CHOICES,
        required=False,
        allow_null=True,
        allow_blank=True
    )
    poids = serializers.FloatField(required=False, allow_null=True, min_value=0.1)
    taille = serializers.FloatField(required=False, allow_null=True, min_value=0.1)
    allergies = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    antecedents = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def update(self, instance, validated_data):
        """Met a jour un dossier patient."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
