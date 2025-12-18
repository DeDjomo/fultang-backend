"""
Serializers pour le modele Admin.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from rest_framework import serializers
from apps.gestion_hospitaliere.models import Admin
from django.contrib.auth.hashers import make_password


class AdminSerializer(serializers.ModelSerializer):
    """Serializer pour le modele Admin."""

    class Meta:
        model = Admin
        fields = ['id', 'login', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        """
        Valide qu'une seule entree admin peut exister.
        """
        if not self.instance and Admin.objects.exists():
            raise serializers.ValidationError({
                'detail': 'Un administrateur existe deja dans le systeme. '
                         'Impossible de creer un nouvel administrateur. '
                         'Utilisez PUT/PATCH pour modifier l\'administrateur existant.'
            })
        return data

    def validate_login(self, value):
        """Valide que le login n'est pas vide."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                'Le login ne peut pas etre vide. Veuillez fournir un login valide.'
            )
        return value.strip()

    def validate_password(self, value):
        """Valide la robustesse du mot de passe."""
        if len(value) < 8:
            raise serializers.ValidationError(
                'Le mot de passe doit contenir au moins 8 caracteres. '
                f'Longueur actuelle: {len(value)} caracteres.'
            )

        if not any(char.isupper() for char in value):
            raise serializers.ValidationError(
                'Le mot de passe doit contenir au moins une lettre majuscule.'
            )

        if not any(char.islower() for char in value):
            raise serializers.ValidationError(
                'Le mot de passe doit contenir au moins une lettre minuscule.'
            )

        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError(
                'Le mot de passe doit contenir au moins un chiffre.'
            )

        return value

    def create(self, validated_data):
        """Hash le mot de passe avant la creation."""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Hash le mot de passe avant la mise a jour si modifie."""
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)
