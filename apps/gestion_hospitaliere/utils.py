"""
Utilitaires pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
import secrets
import string


def generate_robust_password(length=12):
    """
    Genere un mot de passe robuste.

    Le mot de passe genere contient:
    - Au moins 1 majuscule
    - Au moins 1 minuscule
    - Au moins 1 chiffre
    - Au moins 1 caractere special
    - Longueur minimum de 12 caracteres

    Args:
        length (int): Longueur du mot de passe (par defaut 12)

    Returns:
        str: Mot de passe genere
    """
    if length < 8:
        raise ValueError('La longueur du mot de passe doit etre au moins 8.')

    alphabet = string.ascii_letters + string.digits + string.punctuation

    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))

        # Verifier qu'il contient tous les types de caracteres requis
        if (any(c.islower() for c in password) and
            any(c.isupper() for c in password) and
            any(c.isdigit() for c in password) and
            any(c in string.punctuation for c in password)):
            return password
