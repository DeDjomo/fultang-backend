"""
Taches Celery pour l'application gestion_hospitaliere.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from celery import shared_task
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task
def send_personnel_password_email(personnel_id, password):
    """
    Envoie un email au personnel avec son mot de passe temporaire.

    Le mot de passe est valide pendant 3 jours. Apres ce delai, si le personnel
    ne s'est pas connecte, le compte sera bloque.

    Args:
        personnel_id (int): ID du personnel
        password (str): Mot de passe temporaire en clair

    Returns:
        str: Message de confirmation ou d'erreur
    """
    from apps.gestion_hospitaliere.models import Personnel

    try:
        personnel = Personnel.objects.get(id=personnel_id)

        subject = 'Bienvenue a Fultang Hospital - Vos identifiants de connexion'
        message = f"""
Bonjour {personnel.prenom} {personnel.nom},

Votre compte a ete cree avec succes dans le systeme de gestion Fultang Hospital.

Vos identifiants de connexion:
- Email/Matricule: {personnel.email} ou {personnel.matricule}
- Mot de passe: {password}

IMPORTANT:
- Ce mot de passe est valide pendant 3 jours.
- Veuillez vous connecter et changer votre mot de passe dans les 3 jours.
- Passe ce delai, votre compte sera bloque et vous devrez contacter l'administrateur.

Pour vous connecter, utilisez votre email ou matricule avec le mot de passe ci-dessus.

Cordialement,
L'equipe Fultang Hospital
"""

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [personnel.email],
            fail_silently=False,
        )

        # Log pour recuperer le mot de passe en dev
        logger.info(f"EMAIL ENVOYE A: {personnel.email}, PASSWORD: {password}")

        return f"Email envoye a {personnel.email}"

    except Personnel.DoesNotExist:
        return f"Personnel avec ID {personnel_id} introuvable"
    except Exception as e:
        return f"Erreur lors de l'envoi de l'email: {str(e)}"


@shared_task
def check_expired_passwords():
    """
    Tache periodique pour verifier et bloquer les mots de passe expires.

    Cette tache doit etre executee quotidiennement via Celery Beat.
    Elle recherche tous les personnels qui n'ont pas effectue leur premiere
    connexion et dont le mot de passe a expire (3 jours), puis bloque leur compte.

    Returns:
        str: Nombre de comptes bloques
    """
    from apps.gestion_hospitaliere.models import Personnel

    expired_personnel = Personnel.objects.filter(
        first_login_done=False,
        password_expiry_date__lt=timezone.now()
    )

    count = 0
    for personnel in expired_personnel:
        # Bloquer le compte en definissant le mot de passe a 'interdit'
        personnel.set_password('interdit')
        personnel.save(update_fields=['password'])
        count += 1

    return f"Bloque {count} mot(s) de passe expire(s)"


@shared_task
def auto_terminate_inactive_sessions():
    """
    Tache periodique pour terminer automatiquement les sessions inactives.

    Selon users.md: si apres deux jours d'affilee aucune action (update, patch etc)
    n'a ete faite sur une session, son statut passe automatiquement a 'terminee'.

    Cette tache doit etre executee quotidiennement via Celery Beat.

    Returns:
        str: Nombre de sessions terminees
    """
    from apps.suivi_patient.models import Session

    # Calculer la date limite (il y a 2 jours)
    date_limite = timezone.now() - timedelta(days=2)

    # Trouver les sessions non terminees et inactives depuis 2 jours
    sessions_inactives = Session.objects.filter(
        derniere_action__lt=date_limite
    ).exclude(statut='terminee')

    count = 0
    for session in sessions_inactives:
        session.statut = 'terminee'
        session.fin = timezone.now()
        # Utiliser update_fields pour eviter de mettre a jour derniere_action
        Session.objects.filter(pk=session.pk).update(
            statut='terminee',
            fin=timezone.now()
        )
        count += 1
        logger.info(f"Session {session.id} terminee automatiquement (inactive depuis 2 jours)")

    return f"Termine {count} session(s) inactive(s)"

