"""
WebSocket consumers for real-time updates.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async


class UpdateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer that broadcasts model changes to connected clients.
    Clients can subscribe to specific groups like 'patients', 'appointments', etc.
    """

    async def connect(self):
        """Handle WebSocket connection."""
        # Add to the general updates group
        self.room_group_name = 'updates'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send confirmation message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to real-time updates'
        }))

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Handle incoming messages from WebSocket."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', '')
            
            # Handle subscription requests
            if message_type == 'subscribe':
                groups = data.get('groups', [])
                for group in groups:
                    await self.channel_layer.group_add(
                        f'updates_{group}',
                        self.channel_name
                    )
                await self.send(text_data=json.dumps({
                    'type': 'subscribed',
                    'groups': groups
                }))
            
            # Handle ping/pong for connection keep-alive
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON'
            }))

    async def model_update(self, event):
        """
        Handle model update events broadcasted from Django signals.
        This method is called when a message with type 'model_update' is sent to the group.
        """
        await self.send(text_data=json.dumps({
            'type': 'model_update',
            'model': event.get('model'),
            'action': event.get('action'),  # 'create', 'update', 'delete'
            'id': event.get('id'),
            'data': event.get('data', None),
            'timestamp': event.get('timestamp')
        }))

    async def notification(self, event):
        """Handle general notification events."""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': event.get('message'),
            'level': event.get('level', 'info'),
            'timestamp': event.get('timestamp')
        }))
