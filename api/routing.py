"""
WebSocket URL routing.

Author: DeDjomo
Organization: ENSPY
Date: 2025-12-26
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/updates/$', consumers.UpdateConsumer.as_asgi()),
]
