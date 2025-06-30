from chat.routing import chat_websocket_urlpatterns
from pong.routing import pong_websocket_urlpatterns
from users.routing import notifications_websocket_urlpatterns


websocket_urlpatterns = chat_websocket_urlpatterns \
    + pong_websocket_urlpatterns \
    + notifications_websocket_urlpatterns
