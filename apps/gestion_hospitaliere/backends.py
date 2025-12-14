"""
Backend d'authentification personnalise pour Personnel.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-14
"""
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from apps.gestion_hospitaliere.models import Personnel


class EmailOrMatriculeBackend(ModelBackend):
    """
    Backend d'authentification permettant la connexion via:
    - Email + mot de passe
    - Matricule + mot de passe
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authentifie un utilisateur via email ou matricule.

        Args:
            username: Peut etre l'email ou le matricule
            password: Mot de passe de l'utilisateur

        Returns:
            Personnel object si authentification reussie, None sinon
        """
        if username is None or password is None:
            return None

        try:
            # Rechercher par email ou matricule
            user = Personnel.objects.get(
                Q(email__iexact=username) | Q(matricule__iexact=username)
            )

            # Verifier le mot de passe
            if user.check_password(password):
                # Verifier que le compte est actif
                if user.is_active:
                    return user
                return None

            return None

        except Personnel.DoesNotExist:
            # Executer un hash pour eviter les attaques de timing
            Personnel().set_password(password)
            return None

    def get_user(self, user_id):
        """Recupere un utilisateur par son ID."""
        try:
            return Personnel.objects.get(pk=user_id)
        except Personnel.DoesNotExist:
            return None
