"""
Serializers pour les endpoints medecin (prescriptions, hospitalisations, chambres).

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework import serializers
from apps.suivi_patient.models import (
    PrescriptionMedicament,
    PrescriptionExamen,
    ResultatExamen,
    Hospitalisation,
)
from apps.gestion_hospitaliere.models import Chambre, Medecin


# ============ PRESCRIPTIONS MEDICAMENTS ============

class PrescriptionMedicamentSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des prescriptions de medicaments."""

    medecin_nom = serializers.CharField(source='id_medecin.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='id_medecin.prenom', read_only=True)
    patient_nom = serializers.CharField(source='id_session.id_patient.nom', read_only=True)
    patient_matricule = serializers.CharField(source='id_session.id_patient.matricule', read_only=True)

    class Meta:
        model = PrescriptionMedicament
        fields = [
            'id', 'id_medecin', 'medecin_nom', 'medecin_prenom',
            'liste_medicaments', 'id_session', 'date_heure',
            'patient_nom', 'patient_matricule'
        ]
        read_only_fields = ['id', 'date_heure']


class PrescriptionMedicamentCreateSerializer(serializers.Serializer):
    """Serializer pour la creation d'une prescription de medicaments."""

    id_medecin = serializers.IntegerField()
    liste_medicaments = serializers.CharField()
    id_session = serializers.IntegerField()

    def validate_id_medecin(self, value):
        """Verifie que le medecin existe."""
        if not Medecin.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun medecin trouve avec l\'ID {value}.'
            )
        return value

    def validate_id_session(self, value):
        """Verifie que la session existe."""
        from apps.suivi_patient.models import Session
        if not Session.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune session trouvee avec l\'ID {value}.'
            )
        return value

    def create(self, validated_data):
        """Cree une nouvelle prescription de medicaments."""
        prescription = PrescriptionMedicament.objects.create(
            id_medecin_id=validated_data['id_medecin'],
            liste_medicaments=validated_data['liste_medicaments'],
            id_session_id=validated_data['id_session']
        )
        return prescription


# ============ PRESCRIPTIONS EXAMENS ============

class PrescriptionExamenSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des prescriptions d'examens."""

    medecin_nom = serializers.CharField(source='id_medecin.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='id_medecin.prenom', read_only=True)
    patient_nom = serializers.CharField(source='id_session.id_patient.nom', read_only=True)
    patient_matricule = serializers.CharField(source='id_session.id_patient.matricule', read_only=True)

    class Meta:
        model = PrescriptionExamen
        fields = [
            'id', 'id_medecin', 'medecin_nom', 'medecin_prenom',
            'nom_examen', 'id_session', 'date_heure',
            'patient_nom', 'patient_matricule'
        ]
        read_only_fields = ['id', 'date_heure']


class PrescriptionExamenCreateSerializer(serializers.Serializer):
    """Serializer pour la creation d'une prescription d'examen."""

    id_medecin = serializers.IntegerField()
    nom_examen = serializers.CharField(max_length=200)
    id_session = serializers.IntegerField()

    def validate_id_medecin(self, value):
        """Verifie que le medecin existe."""
        if not Medecin.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun medecin trouve avec l\'ID {value}.'
            )
        return value

    def validate_id_session(self, value):
        """Verifie que la session existe."""
        from apps.suivi_patient.models import Session
        if not Session.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune session trouvee avec l\'ID {value}.'
            )
        return value

    def create(self, validated_data):
        """Cree une nouvelle prescription d'examen."""
        prescription = PrescriptionExamen.objects.create(
            id_medecin_id=validated_data['id_medecin'],
            nom_examen=validated_data['nom_examen'],
            id_session_id=validated_data['id_session']
        )
        return prescription


# ============ RESULTATS EXAMENS ============

class ResultatExamenSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des resultats d'examens."""

    medecin_nom = serializers.CharField(source='id_medecin.nom', read_only=True)
    medecin_prenom = serializers.CharField(source='id_medecin.prenom', read_only=True)
    nom_examen = serializers.CharField(source='id_prescription.nom_examen', read_only=True)

    class Meta:
        model = ResultatExamen
        fields = [
            'id', 'id_medecin', 'medecin_nom', 'medecin_prenom',
            'resultat', 'id_prescription', 'nom_examen', 'date_heure'
        ]
        read_only_fields = ['id', 'date_heure']


class ResultatExamenCreateSerializer(serializers.Serializer):
    """Serializer pour la creation d'un resultat d'examen."""

    id_medecin = serializers.IntegerField()
    resultat = serializers.CharField()
    id_prescription = serializers.IntegerField()

    def validate_id_medecin(self, value):
        """Verifie que le medecin existe."""
        if not Medecin.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun medecin trouve avec l\'ID {value}.'
            )
        return value

    def validate_id_prescription(self, value):
        """Verifie que la prescription existe."""
        if not PrescriptionExamen.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune prescription trouvee avec l\'ID {value}.'
            )
        return value

    def create(self, validated_data):
        """Cree un nouveau resultat d'examen."""
        resultat = ResultatExamen.objects.create(
            id_medecin_id=validated_data['id_medecin'],
            resultat=validated_data['resultat'],
            id_prescription_id=validated_data['id_prescription']
        )
        return resultat


# ============ HOSPITALISATIONS ============

class HospitalisationSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des hospitalisations."""

    patient_nom = serializers.CharField(source='id_session.id_patient.nom', read_only=True)
    patient_matricule = serializers.CharField(source='id_session.id_patient.matricule', read_only=True)
    medecin_nom = serializers.CharField(source='id_medecin.nom', read_only=True)
    medecin_specialite = serializers.CharField(source='id_medecin.specialite', read_only=True)
    chambre_numero = serializers.CharField(source='id_chambre.numero_chambre', read_only=True)

    class Meta:
        model = Hospitalisation
        fields = [
            'id', 'id_session', 'id_chambre', 'debut', 'fin', 'statut',
            'id_medecin', 'patient_nom', 'patient_matricule',
            'medecin_nom', 'medecin_specialite', 'chambre_numero'
        ]
        read_only_fields = ['id', 'debut']


class HospitalisationCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'une hospitalisation.

    Note (description.md ligne 175-176):
    - Decremente automatiquement nombre_places_dispo de la chambre
    - Verifie que nombre_places_dispo > 0
    """

    id_session = serializers.IntegerField()
    id_chambre = serializers.IntegerField()
    id_medecin = serializers.IntegerField()

    def validate_id_session(self, value):
        """Verifie que la session existe."""
        from apps.suivi_patient.models import Session
        if not Session.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucune session trouvee avec l\'ID {value}.'
            )
        return value

    def validate_id_chambre(self, value):
        """Verifie que la chambre existe et a des places disponibles."""
        try:
            chambre = Chambre.objects.get(id=value)
            if chambre.nombre_places_dispo <= 0:
                raise serializers.ValidationError(
                    f'La chambre {chambre.numero_chambre} n\'a plus de places disponibles.'
                )
        except Chambre.DoesNotExist:
            raise serializers.ValidationError(
                f'Aucune chambre trouvee avec l\'ID {value}.'
            )
        return value

    def validate_id_medecin(self, value):
        """Verifie que le medecin existe."""
        if not Medecin.objects.filter(id=value).exists():
            raise serializers.ValidationError(
                f'Aucun medecin trouve avec l\'ID {value}.'
            )
        return value

    def create(self, validated_data):
        """
        Cree une nouvelle hospitalisation.

        Le modele Hospitalisation decremente automatiquement
        nombre_places_dispo dans sa methode save().
        """
        hospitalisation = Hospitalisation.objects.create(
            id_session_id=validated_data['id_session'],
            id_chambre_id=validated_data['id_chambre'],
            id_medecin_id=validated_data['id_medecin']
        )
        return hospitalisation


# ============ CHAMBRES ============

class ChambreSerializer(serializers.ModelSerializer):
    """Serializer pour la lecture des chambres."""

    class Meta:
        model = Chambre
        fields = [
            'id', 'numero_chambre', 'nombre_places_total',
            'nombre_places_dispo', 'tarif_journalier'
        ]
        read_only_fields = ['id']


class ChambreCreateSerializer(serializers.Serializer):
    """Serializer pour la creation d'une chambre."""

    numero_chambre = serializers.CharField(max_length=50)
    nombre_places_total = serializers.IntegerField(min_value=1)
    tarif_journalier = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)

    def validate_numero_chambre(self, value):
        """Verifie que le numero de chambre est unique."""
        if Chambre.objects.filter(numero_chambre=value).exists():
            raise serializers.ValidationError(
                f'Le numero de chambre "{value}" existe deja.'
            )
        return value

    def create(self, validated_data):
        """Cree une nouvelle chambre."""
        # nombre_places_dispo = nombre_places_total par defaut
        validated_data['nombre_places_dispo'] = validated_data['nombre_places_total']
        chambre = Chambre.objects.create(**validated_data)
        return chambre
