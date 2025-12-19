"""
Authentification personnalisée pour JWT avec support Admin et Personnel.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from apps.gestion_hospitaliere.models import Personnel, Admin


class CustomJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT personnalisée qui gère Admin et Personnel.
    """

    def get_user(self, validated_token):
        """
        Récupère l'utilisateur depuis le token validé.
        Gère à la fois les Admin et les Personnel.
        """
        try:
            user_id = validated_token.get(self.get_jwt_claim())
        except Exception:
            return None

        # Essayer d'abord Personnel
        try:
            user = Personnel.objects.get(id=user_id)
            return user
        except Personnel.DoesNotExist:
            pass

        # Essayer ensuite Admin
        try:
            admin = Admin.objects.get(id=user_id)
            # Ajouter les attributs nécessaires pour DRF
            admin.is_authenticated = True
            admin.is_active = True
            admin.is_staff = True
            admin.is_superuser = True
            return admin
        except Admin.DoesNotExist:
            return None

    def get_jwt_claim(self):
        """Retourne le nom du claim contenant l'ID utilisateur."""
        return 'user_id'
