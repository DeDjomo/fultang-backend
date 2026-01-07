"""
Permissions personnalisées pour l'API comptabilite_matiere.

En développement: AllowAny
En production: IsAuthenticated
"""
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings


class DevelopmentOrAuthenticated(IsAuthenticated):
    """
    Permission qui autorise tout en développement et requiert 
    l'authentification en production.
    """
    def has_permission(self, request, view):
        if settings.DEBUG:
            return True
        return super().has_permission(request, view)


# Utiliser cette permission par défaut
DefaultPermission = DevelopmentOrAuthenticated if settings.DEBUG else IsAuthenticated
