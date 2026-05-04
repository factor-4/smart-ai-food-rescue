package com.smartfood.notification_service.websocket;


import com.smartfood.notification_service.event.InventoryUpdatedEvent;
import com.smartfood.notification_service.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastInventoryUpdate(InventoryUpdatedEvent event) {
        String destination = "/topic/bags/" + event.getBagId();

        log.info("Broadcasting inventory update to {}: quantity={}",
                destination, event.getAvailableQuantity());

        messagingTemplate.convertAndSend(destination, event);
    }

    public void broadcastOrderUpdate(OrderStatusChangedEvent event) {
        String destination = "/queue/users/" + event.getUserId();

        log.info("Broadcasting order update to {}: orderId={}, status={}",
                destination, event.getOrderId(), event.getNewStatus());

        messagingTemplate.convertAndSendToUser(
                event.getUserId().toString(),
                "/queue/order-updates",
                event
        );
    }
}