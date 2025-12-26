"""
Django signals for broadcasting model changes via WebSocket.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
import json
from datetime import datetime
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def broadcast_model_change(model_name, action, instance_id, data=None):
    """
    Broadcast a model change to all connected WebSocket clients.
    
    Args:
        model_name: Name of the model (e.g., 'patient', 'appointment')
        action: Type of action ('create', 'update', 'delete')
        instance_id: ID of the affected instance
        data: Optional data to include (serialized model data)
    """
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    
    message = {
        'type': 'model_update',
        'model': model_name,
        'action': action,
        'id': instance_id,
        'data': data,
        'timestamp': datetime.now().isoformat()
    }
    
    # Broadcast to the general updates group
    async_to_sync(channel_layer.group_send)(
        'updates',
        message
    )
    
    # Also broadcast to model-specific group
    async_to_sync(channel_layer.group_send)(
        f'updates_{model_name}',
        message
    )


def get_safe_instance_data(instance, fields=None):
    """
    Safely extract data from a model instance.
    
    Args:
        instance: Django model instance
        fields: Optional list of field names to include
    """
    try:
        data = {}
        if fields:
            for field in fields:
                value = getattr(instance, field, None)
                if hasattr(value, 'isoformat'):
                    value = value.isoformat()
                elif hasattr(value, 'pk'):
                    value = value.pk
                data[field] = value
        else:
            # Get basic fields only
            data = {
                'id': getattr(instance, 'id', None),
                'pk': getattr(instance, 'pk', None),
            }
        return data
    except Exception:
        return {'id': getattr(instance, 'pk', None)}


# =============================================================================
# Patient signals
# =============================================================================
try:
    from apps.suivi_patient.models import Patient
    
    @receiver(post_save, sender=Patient)
    def patient_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'nom', 'prenom', 'matricule', 'contact'])
        broadcast_model_change('patient', action, instance.pk, data)
    
    @receiver(post_delete, sender=Patient)
    def patient_deleted(sender, instance, **kwargs):
        broadcast_model_change('patient', 'delete', instance.pk)
except ImportError:
    pass


# =============================================================================
# RendezVous (Appointments) signals
# =============================================================================
try:
    from apps.suivi_patient.models import RendezVous
    
    @receiver(post_save, sender=RendezVous)
    def rendezvous_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'date_heure', 'motif', 'statut'])
        broadcast_model_change('appointment', action, instance.pk, data)
    
    @receiver(post_delete, sender=RendezVous)
    def rendezvous_deleted(sender, instance, **kwargs):
        broadcast_model_change('appointment', 'delete', instance.pk)
except ImportError:
    pass


# =============================================================================
# Session signals
# =============================================================================
try:
    from apps.suivi_patient.models import Session
    
    @receiver(post_save, sender=Session)
    def session_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'date_ouverture', 'statut'])
        broadcast_model_change('session', action, instance.pk, data)
    
    @receiver(post_delete, sender=Session)
    def session_deleted(sender, instance, **kwargs):
        broadcast_model_change('session', 'delete', instance.pk)
except ImportError:
    pass


# =============================================================================
# Facture signals
# =============================================================================
try:
    from apps.comptabilite_financiere.models import Facture
    
    @receiver(post_save, sender=Facture)
    def facture_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'numero', 'montant_total', 'statut'])
        broadcast_model_change('facture', action, instance.pk, data)
    
    @receiver(post_delete, sender=Facture)
    def facture_deleted(sender, instance, **kwargs):
        broadcast_model_change('facture', 'delete', instance.pk)
except ImportError:
    pass


# =============================================================================
# Paiement signals
# =============================================================================
try:
    from apps.comptabilite_financiere.models import Paiement
    
    @receiver(post_save, sender=Paiement)
    def paiement_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'montant', 'mode_paiement'])
        broadcast_model_change('paiement', action, instance.pk, data)
    
    @receiver(post_delete, sender=Paiement)
    def paiement_deleted(sender, instance, **kwargs):
        broadcast_model_change('paiement', 'delete', instance.pk)
except ImportError:
    pass


# =============================================================================
# Consultation signals
# =============================================================================
try:
    from apps.suivi_patient.models import Consultation
    
    @receiver(post_save, sender=Consultation)
    def consultation_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'date_consultation'])
        broadcast_model_change('consultation', action, instance.pk, data)
    
    @receiver(post_delete, sender=Consultation)
    def consultation_deleted(sender, instance, **kwargs):
        broadcast_model_change('consultation', 'delete', instance.pk)
except ImportError:
    pass


# =============================================================================
# Personnel signals
# =============================================================================
try:
    from apps.gestion_hospitaliere.models import Personnel
    
    @receiver(post_save, sender=Personnel)
    def personnel_saved(sender, instance, created, **kwargs):
        action = 'create' if created else 'update'
        data = get_safe_instance_data(instance, ['id', 'nom', 'prenom', 'matricule', 'role'])
        broadcast_model_change('personnel', action, instance.pk, data)
    
    @receiver(post_delete, sender=Personnel)
    def personnel_deleted(sender, instance, **kwargs):
        broadcast_model_change('personnel', 'delete', instance.pk)
except ImportError:
    pass
