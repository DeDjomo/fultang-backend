"""
Commande Django pour créer l'admin par défaut.

Author: DeDjomo
Email: dedjomokarlyn@gmail.com
Organization: ENSPY (Ecole Nationale Superieure Polytechnique de Yaounde)
Date: 2025-12-15
"""
from django.core.management.base import BaseCommand
from apps.gestion_hospitaliere.models import Admin


class Command(BaseCommand):
    help = 'Crée l\'admin par défaut pour l\'API Fultang Hospital'

    def add_arguments(self, parser):
        parser.add_argument(
            '--login',
            type=str,
            default='admin@fultang.com',
            help='Login de l\'admin (défaut: admin@fultang.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Admin@2024',
            help='Mot de passe de l\'admin (défaut: Admin@2024)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Supprimer l\'admin existant s\'il existe'
        )

    def handle(self, *args, **options):
        from django.contrib.auth.hashers import make_password

        login = options['login']
        password = options['password']
        force = options['force']

        # Vérifier si l'admin existe déjà
        existing_admin = Admin.objects.filter(login=login).first()

        if existing_admin:
            if force:
                self.stdout.write(
                    self.style.WARNING(f'Suppression de l\'admin existant: {login}')
                )
                existing_admin.delete()
            else:
                self.stdout.write(
                    self.style.ERROR(f'Un admin avec le login {login} existe déjà.')
                )
                self.stdout.write(
                    self.style.WARNING('Utilisez --force pour le supprimer et en créer un nouveau.')
                )
                self.stdout.write(
                    self.style.WARNING('Ou utilisez un login différent avec --login')
                )
                return

        # Créer l'admin
        try:
            admin = Admin.objects.create(
                login=login,
                password=make_password(password)
            )

            self.stdout.write(self.style.SUCCESS(''))
            self.stdout.write(self.style.SUCCESS('='*70))
            self.stdout.write(self.style.SUCCESS('Admin créé avec succès!'))
            self.stdout.write(self.style.SUCCESS('='*70))
            self.stdout.write(self.style.SUCCESS(f'Login        : {login}'))
            self.stdout.write(self.style.SUCCESS(f'Mot de passe : {password}'))
            self.stdout.write(self.style.SUCCESS('='*70))
            self.stdout.write(self.style.SUCCESS(''))
            self.stdout.write(
                self.style.WARNING('IMPORTANT: Conservez ces identifiants en lieu sûr!')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erreur lors de la création de l\'admin: {str(e)}')
            )
