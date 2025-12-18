"""
Backend d'authentification personnalise pour Personnel et Admin.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.hashers import check_password
from django.db.models import Q
from apps.gestion_hospitaliere.models import Personnel, Admin


class EmailOrMatriculeBackend(ModelBackend):
    """
    Backend d'authentification permettant la connexion via:
    - Email + mot de passe (Personnel)
    - Matricule + mot de passe (Personnel)
    - Login + mot de passe (Admin)
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authentifie un utilisateur (Personnel ou Admin) via email/matricule/login.

        Bloque l'authentification si:
        - Mot de passe = 'interdit' (compte bloque)
        - Mot de passe expire (3 jours sans connexion)
        - Compte inactif

        Args:
            username: Peut etre l'email, le matricule, ou le login
            password: Mot de passe de l'utilisateur

        Returns:
            Personnel ou Admin object si authentification reussie, None sinon
        """
        if username is None or password is None:
            return None

        # Essayer d'abord l'authentification Admin
        try:
            admin = Admin.objects.get(login__iexact=username)
            if check_password(password, admin.password):
                # Ajouter des attributs pour compatibilite avec JWT
                admin.is_active = True
                admin.is_staff = True
                admin.is_superuser = True
                admin.pk = admin.id
                return admin
        except Admin.DoesNotExist:
            pass

        # Essayer ensuite l'authentification Personnel
        try:
            # Rechercher par email ou matricule
            user = Personnel.objects.get(
                Q(email__iexact=username) | Q(matricule__iexact=username)
            )

            # Verifier si mot de passe expire
            if user.check_password_expired():
                # Bloquer le compte
                user.block_expired_password()
                return None

            # Bloquer si mot de passe est "interdit"
            if user.check_password('interdit'):
                return None

            # Verifier le mot de passe
            if user.check_password(password):
                # Verifier que le compte est actif
                if user.is_active:
                    # Mettre a jour statut de connexion
                    user.statut_de_connexion = 'actif'
                    user.save(update_fields=['statut_de_connexion'])
                    return user
                return None

            return None

        except Personnel.DoesNotExist:
            # Executer un hash pour eviter les attaques de timing
            Personnel().set_password(password)
            return None

    def get_user(self, user_id):
        """Recupere un utilisateur par son ID (Personnel ou Admin)."""
        try:
            return Personnel.objects.get(pk=user_id)
        except Personnel.DoesNotExist:
            try:
                admin = Admin.objects.get(pk=user_id)
                # Ajouter des attributs pour compatibilite
                admin.is_active = True
                admin.is_staff = True
                admin.is_superuser = True
                return admin
            except Admin.DoesNotExist:
                return None
