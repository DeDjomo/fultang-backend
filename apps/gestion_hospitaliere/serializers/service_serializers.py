"""
Serializers pour les modeles Service, Personnel et Medecin.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from rest_framework import serializers
from apps.gestion_hospitaliere.models import Service, Personnel, Medecin
from django.contrib.auth.hashers import make_password
import secrets
import string


class PersonnelSerializer(serializers.ModelSerializer):
    """Serializer pour le modele Personnel."""

    service_nom = serializers.CharField(source='service.nom_service', read_only=True)

    class Meta:
        model = Personnel
        fields = [
            'id', 'nom', 'prenom', 'date_naissance', 'email',
            'contact', 'matricule', 'poste', 'statut', 'service', 'service_nom',
            'password_expiry_date', 'first_login_done', 'date_joined'
        ]
        read_only_fields = ['matricule', 'password_expiry_date', 'first_login_done', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class MedecinSerializer(serializers.ModelSerializer):
    """Serializer pour le modele Medecin."""

    service_nom = serializers.CharField(source='service.nom_service', read_only=True)

    class Meta:
        model = Medecin
        fields = [
            'id', 'nom', 'prenom', 'date_naissance', 'email',
            'contact', 'matricule', 'specialite', 'statut', 'service', 'service_nom',
            'password_expiry_date', 'first_login_done', 'date_joined'
        ]
        read_only_fields = ['matricule', 'poste', 'password_expiry_date', 'first_login_done', 'date_joined']


class ServiceSerializer(serializers.ModelSerializer):
    """Serializer pour le modele Service."""

    chef_service_details = PersonnelSerializer(source='chef_service', read_only=True)
    chef_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Service
        fields = ['id', 'nom_service', 'desc_service', 'chef_service', 'chef_service_details', 'chef_email', 'date_creation']
        read_only_fields = ['date_creation', 'chef_service']

    def validate_nom_service(self, value):
        """Valide que le nom du service n'est pas vide."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                'Le nom du service ne peut pas etre vide. Veuillez fournir un nom valide.'
            )
        return value.strip()

    def validate_chef_email(self, value):
        """Valide que l'email du chef est valide."""
        if value:
            value = value.strip().lower()
            # Verifier que le personnel avec cet email existe
            if not Personnel.objects.filter(email=value).exists():
                raise serializers.ValidationError(
                    f'Aucun personnel trouve avec l\'email "{value}". '
                    'Veuillez verifier l\'email ou creer d\'abord le personnel.'
                )
        return value

    def update(self, instance, validated_data):
        """Met a jour le service, en gerant le chef par email."""
        chef_email = validated_data.pop('chef_email', None)

        # Si un email de chef est fourni, rechercher le personnel
        if chef_email:
            try:
                chef = Personnel.objects.get(email=chef_email)
                instance.chef_service = chef
            except Personnel.DoesNotExist:
                raise serializers.ValidationError({
                    'chef_email': f'Aucun personnel trouve avec l\'email "{chef_email}". '
                                'Veuillez verifier l\'email ou creer d\'abord le personnel.'
                })

        # Mettre a jour les autres champs
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class ServiceCreateSerializer(serializers.Serializer):
    """
    Serializer pour la creation d'un service avec son chef.

    Permet de creer un service en fournissant les informations du service
    et du chef de service en meme temps.
    PAS DE USERNAME - il sera auto-genere a partir de l'email.
    PAS D'ID du chef - il sera recherche/cree automatiquement par email.
    """

    # Champs du service
    nom_service = serializers.CharField(max_length=100)
    desc_service = serializers.CharField(required=False, allow_blank=True)

    # Champs du chef de service (PAS de username ni chef_service_id)
    chef_nom = serializers.CharField(max_length=100)
    chef_prenom = serializers.CharField(max_length=100)
    chef_date_naissance = serializers.DateField()
    chef_email = serializers.EmailField()
    chef_contact = serializers.CharField(max_length=9)
    chef_poste = serializers.ChoiceField(choices=Personnel.POSTE_CHOICES)
    chef_specialite = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_nom_service(self, value):
        """Valide que le nom du service est unique."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                'Le nom du service ne peut pas etre vide.'
            )

        if Service.objects.filter(nom_service=value.strip()).exists():
            raise serializers.ValidationError(
                f'Un service avec le nom "{value}" existe deja. '
                'Veuillez choisir un autre nom ou modifier le service existant.'
            )
        return value.strip()

    def validate_chef_email(self, value):
        """Valide que l'email du chef est valide."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                'L\'email du chef de service ne peut pas etre vide.'
            )
        return value.strip().lower()

    def validate_chef_contact(self, value):
        """Valide le format du numero de telephone."""
        if not value or len(value) != 9:
            raise serializers.ValidationError(
                f'Le numero de telephone doit contenir exactement 9 chiffres. '
                f'Longueur actuelle: {len(value) if value else 0}.'
            )

        if not value.startswith('6'):
            raise serializers.ValidationError(
                'Le numero de telephone doit commencer par 6. '
                f'Numero actuel: {value}'
            )

        if not value.isdigit():
            raise serializers.ValidationError(
                'Le numero de telephone ne doit contenir que des chiffres. '
                f'Numero actuel: {value}'
            )

        return value

    def validate(self, data):
        """Valide les donnees du chef de service."""
        # Verifier si un medecin necessite une specialite
        if data.get('chef_poste') == 'medecin' and not data.get('chef_specialite'):
            raise serializers.ValidationError({
                'chef_specialite': 'La specialite est obligatoire pour un medecin. '
                               'Veuillez specifier la specialite du medecin.'
            })

        return data

    def create(self, validated_data):
        """
        Cree le service et le chef de service.

        Si le chef existe deja (par email), on le recupere.
        Sinon, on le cree avec:
        - Username auto-genere a partir de l'email
        - Mot de passe temporaire auto-genere
        """
        # Extraire les donnees du service
        service_data = {
            'nom_service': validated_data['nom_service'],
            'desc_service': validated_data.get('desc_service', ''),
        }

        # Extraire les donnees du chef
        chef_email = validated_data['chef_email']

        # Verifier si le chef existe deja par email
        try:
            if validated_data.get('chef_poste') == 'medecin':
                chef = Medecin.objects.get(email=chef_email)
            else:
                chef = Personnel.objects.get(email=chef_email)
        except (Personnel.DoesNotExist, Medecin.DoesNotExist):
            # Creer le chef s'il n'existe pas
            # Generer username a partir de l'email
            username = chef_email.split('@')[0]
            # S'assurer que le username est unique
            base_username = username
            counter = 1
            while Personnel.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Generer un mot de passe temporaire robuste
            alphabet = string.ascii_letters + string.digits + string.punctuation
            temp_password = ''.join(secrets.choice(alphabet) for _ in range(12))

            chef_data = {
                'username': username,
                'nom': validated_data['chef_nom'],
                'prenom': validated_data['chef_prenom'],
                'date_naissance': validated_data['chef_date_naissance'],
                'email': chef_email,
                'contact': validated_data['chef_contact'],
                'poste': validated_data['chef_poste'],
                'password': make_password(temp_password),
            }

            if validated_data.get('chef_poste') == 'medecin':
                chef_data['specialite'] = validated_data.get('chef_specialite', '')
                chef = Medecin.objects.create(**chef_data)
            else:
                chef = Personnel.objects.create(**chef_data)

        # Creer le service avec le chef
        service_data['chef_service'] = chef
        service = Service.objects.create(**service_data)

        return service

    def to_representation(self, instance):
        """Retourne la representation complete du service cree."""
        return ServiceSerializer(instance).data
