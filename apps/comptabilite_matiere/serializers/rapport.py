from rest_framework import serializers
from apps.comptabilite_matiere.models import Rapport

class RapportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapport
        fields = ['id', 'statut', 'objet', 'corps', 'date_creation', 'id_personnel']
        read_only_fields = ['statut', 'date_creation']
