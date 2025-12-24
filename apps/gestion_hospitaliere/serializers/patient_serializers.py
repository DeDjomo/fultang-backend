"""
Serializers pour le modele Patient.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import serializers
from apps.suivi_patient.models import Patient, RendezVous
from apps.gestion_hospitaliere.models import Personnel, Medecin


class PatientSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des informations du patient."""

    personnel_nom = serializers.CharField(source='id_personnel.nom', read_only=True)
    personnel_prenom = serializers.CharField(source='id_personnel.prenom', read_only=True)
    age = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = [
            'id', 'nom', 'prenom', 'date_naissance', 'adresse',
            'email', 'contact', 'nom_proche', 'contact_proche',
            'matricule', 'date_inscription', 'id_personnel',
            'personnel_nom', 'personnel_prenom', 'age'
        ]
        read_only_fields = ['id', 'matricule', 'date_inscription']

    def get_age(self, obj):
        """Calcule l'age du patient."""
        from django.utils import timezone
        today = timezone.now().date()
        age = today.year - obj.date_naissance.year
        if today.month < obj.date_naissance.month or \
           (today.month == obj.date_naissance.month and today.day < obj.date_naissance.day):
            age -= 1
        return age


class PatientCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'un patient.

    Champs obligatoires:
    - nom, date_naissance, contact, nom_proche, contact_proche, id_personnel

    Champs optionnels:
    - prenom, adresse, email
    """

    nom = serializers.CharField(max_length=100)
    prenom = serializers.CharField(max_length=100, required=False, allow_blank=True)
    date_naissance = serializers.DateField()
    adresse = serializers.CharField(max_length=255, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    contact = serializers.CharField(max_length=9)
    nom_proche = serializers.CharField(max_length=100)
    contact_proche = serializers.CharField(max_length=9)
    id_personnel = serializers.IntegerField()

    def validate_contact(self, value):
        """Valide le format du contact."""
        if not value.isdigit():
            raise serializers.ValidationError(
                'Le contact doit contenir uniquement des chiffres.'
            )
        if len(value) != 9:
            raise serializers.ValidationError(
                'Le contact doit contenir exactement 9 chiffres.'
            )
        if not value.startswith('6'):
            raise serializers.ValidationError(
                'Le contact doit commencer par 6.'
            )
        if Patient.objects.filter(contact=value).exists():
            raise serializers.ValidationError(
                f'Le contact {value} est deja utilise.'
            )
        return value

    def validate_contact_proche(self, value):
        """Valide le format du contact proche."""
        if not value.isdigit():
            raise serializers.ValidationError(
                'Le contact proche doit contenir uniquement des chiffres.'
            )
        if len(value) != 9:
            raise serializers.ValidationError(
                'Le contact proche doit contenir exactement 9 chiffres.'
            )
        if not value.startswith('6'):
            raise serializers.ValidationError(
                'Le contact proche doit commencer par 6.'
            )
        if Patient.objects.filter(contact_proche=value).exists():
            raise serializers.ValidationError(
                f'Le contact proche {value} est deja utilise.'
            )
        return value

    def validate_email(self, value):
        """Valide l'email si fourni."""
        if value and Patient.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                f'L\'email {value} est deja utilise.'
            )
        return value

    def validate_id_personnel(self, value):
        """Verifie que le personnel existe."""
        if not Personnel.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Personnel avec ID {value} n\'existe pas.'
            )
        return value

    def create(self, validated_data):
        """Cree un nouveau patient."""
        # Extraire id_personnel et l'utiliser comme id_personnel_id
        id_personnel = validated_data.pop('id_personnel')

        patient = Patient.objects.create(
            id_personnel_id=id_personnel,
            **validated_data
        )
        return patient


class RendezVousSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des rendez-vous."""

    id_patient = PatientSerializer(read_only=True)
    medecin_nom = serializers.CharField(source='id_medecin.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='id_medecin.prenom', read_only=True)
    medecin_specialite = serializers.CharField(source='id_medecin.specialite', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = RendezVous
        fields = [
            'id', 'date_heure', 'id_patient', 'id_medecin', 'statut', 'statut_display', 'motif',
            'medecin_nom', 'medecin_prenom', 'medecin_specialite'
        ]
        read_only_fields = ['id']


class RendezVousCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'un rendez-vous.

    Accepte les matricules du patient et du medecin.
    """

    matricule_patient = serializers.CharField(max_length=10)
    matricule_medecin = serializers.CharField(max_length=20)
    date_rendez_vous = serializers.DateField()
    heure_rendez_vous = serializers.TimeField()

    def validate_matricule_patient(self, value):
        """Verifie que le patient existe."""
        try:
            patient = Patient.objects.get(matricule=value)
            return patient.id
        except Patient.DoesNotExist:
            raise serializers.ValidationError(
                f'Aucun patient trouve avec le matricule "{value}". '
                'Veuillez verifier le matricule.'
            )

    def validate_matricule_medecin(self, value):
        """Verifie que le medecin existe."""
        try:
            medecin = Medecin.objects.get(matricule=value)
            return medecin.id
        except Medecin.DoesNotExist:
            raise serializers.ValidationError(
                f'Aucun medecin trouve avec le matricule "{value}". '
                'Veuillez verifier le matricule.'
            )

    def validate(self, attrs):
        """Valide la date et l'heure du rendez-vous."""
        from django.utils import timezone
        import datetime

        date_rdv = attrs.get('date_rendez_vous')
        heure_rdv = attrs.get('heure_rendez_vous')

        # Combiner date et heure
        rdv_datetime = timezone.make_aware(
            datetime.datetime.combine(date_rdv, heure_rdv)
        )

        # Verifier que le rendez-vous est dans le futur
        if rdv_datetime < timezone.now():
            raise serializers.ValidationError(
                'Le rendez-vous doit etre dans le futur.'
            )

        # Stocker le datetime combine pour la creation
        attrs['date_heure'] = rdv_datetime

        return attrs

    def create(self, validated_data):
        """Cree un nouveau rendez-vous."""
        # Recuperer les IDs valides
        id_patient = validated_data['matricule_patient']
        id_medecin = validated_data['matricule_medecin']
        date_heure = validated_data['date_heure']

        # Creer le rendez-vous avec statut par defaut
        rendez_vous = RendezVous.objects.create(
            id_patient_id=id_patient,
            id_medecin_id=id_medecin,
            date_heure=date_heure,
            statut='en_attente'
        )

        return rendez_vous
