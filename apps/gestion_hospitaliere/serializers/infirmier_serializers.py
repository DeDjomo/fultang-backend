"""
Serializers pour les endpoints infirmier et medecin.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import serializers
from apps.suivi_patient.models import Session, ObservationMedicale
from apps.gestion_hospitaliere.serializers import PatientSerializer


class SessionSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des sessions."""

    patient = PatientSerializer(source='id_patient', read_only=True)
    personnel_nom = serializers.CharField(source='id_personnel.nom', read_only=True)
    personnel_prenom = serializers.CharField(source='id_personnel.prenom', read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'debut', 'fin', 'id_patient', 'patient',
            'id_personnel', 'personnel_nom', 'personnel_prenom',
            'service_courant', 'personnel_responsable',
            'statut', 'situation_patient'
        ]
        read_only_fields = ['id', 'debut']


class PatientEnAttenteSerializer(serializers.Serializer):
    """
    Serializer pour les patients en attente.

    Ajoute l'id_session aux donnees du patient.
    """
    id_session = serializers.IntegerField()
    patient = PatientSerializer()


class SelectionnerPatientSerializer(serializers.Serializer):
    """
    Serializer pour selectionner un patient.

    Change situation_patient a 'recu'.
    """
    id_session = serializers.IntegerField()

    def validate_id_session(self, value):
        """Verifie que la session existe."""
        if not Session.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune session trouvee avec l\'ID {value}.'
            )
        return value


class ObservationMedicaleSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des observations medicales."""

    personnel_nom = serializers.CharField(source='id_personnel.nom', read_only=True)
    personnel_prenom = serializers.CharField(source='id_personnel.prenom', read_only=True)
    patient_nom = serializers.CharField(source='id_session.id_patient.nom', read_only=True)
    patient_prenom = serializers.CharField(source='id_session.id_patient.prenom', read_only=True)

    class Meta:
        model = ObservationMedicale
        fields = [
            'id', 'id_personnel', 'personnel_nom', 'personnel_prenom',
            'observation', 'date_heure', 'id_session',
            'patient_nom', 'patient_prenom'
        ]
        read_only_fields = ['id', 'date_heure']


class ObservationMedicaleCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'une observation medicale.

    Champs obligatoires:
    - id_personnel: ID du personnel realisant l'observation
    - observation: Contenu de l'observation
    - id_session: ID de la session
    """

    id_personnel = serializers.IntegerField()
    observation = serializers.CharField()
    id_session = serializers.IntegerField()

    def validate_id_personnel(self, value):
        """Verifie que le personnel existe."""
        from apps.gestion_hospitaliere.models import Personnel
        if not Personnel.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun personnel trouve avec l\'ID {value}.'
            )
        return value

    def validate_id_session(self, value):
        """Verifie que la session existe."""
        if not Session.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune session trouvee avec l\'ID {value}.'
            )
        return value

    def create(self, validated_data):
        """Cree une nouvelle observation medicale."""
        observation = ObservationMedicale.objects.create(**validated_data)
        return observation


class RedirectionPatientSerializer(serializers.Serializer):
    """
    Serializer pour la redirection d'un patient.

    Types de redirection:
    - 'service': Redirection vers un service (change service_courant)
    - 'personnel': Redirection vers un poste de personnel (change personnel_responsable)
    """

    TYPE_CHOICES = [
        ('service', 'Service'),
        ('personnel', 'Personnel'),
    ]

    id_session = serializers.IntegerField()
    type_redirection = serializers.ChoiceField(choices=TYPE_CHOICES)
    redirection = serializers.CharField(max_length=100)

    def validate_id_session(self, value):
        """Verifie que la session existe."""
        if not Session.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune session trouvee avec l\'ID {value}.'
            )
        return value

    def validate(self, attrs):
        """Valide la redirection selon le type."""
        type_redirection = attrs.get('type_redirection')
        redirection = attrs.get('redirection')

        if type_redirection == 'service':
            # Verifier que le service existe
            from apps.gestion_hospitaliere.models import Service
            if not Service.objects.filter(nom_service=redirection).exists():
                raise serializers.ValidationError({
                    'redirection': f'Aucun service trouve avec le nom "{redirection}".'
                })

        elif type_redirection == 'personnel':
            # Verifier que le poste existe
            from apps.gestion_hospitaliere.models import Personnel
            postes_valides = [choice[0] for choice in Personnel.POSTE_CHOICES]
            if redirection not in postes_valides:
                raise serializers.ValidationError({
                    'redirection': f'Poste "{redirection}" invalide. '
                                   f'Postes valides: {", ".join(postes_valides)}'
                })

        return attrs
