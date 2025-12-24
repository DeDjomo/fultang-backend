from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.comptabilite_matiere.models import Rapport
from apps.comptabilite_matiere.serializers import RapportSerializer

class RapportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing Rapport objects.
    Provides standard CRUD and a custom action to mark a report as read ("lu").
    """
    queryset = Rapport.objects.all()
    serializer_class = RapportSerializer

    @action(detail=True, methods=["post"], url_path="marquer-lu")
    def marquer_lu(self, request, pk=None):
        rapport = self.get_object()
        rapport.statut = "lu"
        rapport.save()
        return Response({"status": "rapport marqué comme lu"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="par-statut")
    def par_statut(self, request):
        """
        Récupère les rapports filtrés par statut.
        Paramètre de requête attendu: ?statut=lu ou ?statut=non lu
        """
        statut_param = request.query_params.get("statut")
        if not statut_param:
            return Response(
                {"error": "Le paramètre 'statut' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rapports = self.queryset.filter(statut=statut_param)
        serializer = self.get_serializer(rapports, many=True)
        return Response(serializer.data)
