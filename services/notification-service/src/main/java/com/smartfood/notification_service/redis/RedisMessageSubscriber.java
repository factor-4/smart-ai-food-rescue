package com.smartfood.notification_service.redis;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfood.notification_service.event.InventoryUpdatedEvent;
import com.smartfood.notification_service.event.OrderStatusChangedEvent;
import com.smartfood.notification_service.websocket.WebSocketBroadcaster;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisMessageSubscriber implements MessageListener {

    private final WebSocketBroadcaster webSocketBroadcaster;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(pattern);
            String body = new String(message.getBody());

            log.info("Redis message received on channel: {}", channel);

            if (channel.equals("inventory-updates")) {
                InventoryUpdatedEvent event = objectMapper
                        .readValue(body, InventoryUpdatedEvent.class);
                webSocketBroadcaster.broadcastInventoryUpdate(event);

            } else if (channel.equals("order-status-updates")) {
                OrderStatusChangedEvent event = objectMapper
                        .readValue(body, OrderStatusChangedEvent.class);
                webSocketBroadcaster.broadcastOrderUpdate(event);
            }

        } catch (Exception e) {
            log.error("Failed to process Redis message: {}", e.getMessage(), e);
        }
    }
}
