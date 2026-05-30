package com.smartfood.notification_service.websocket;


import com.smartfood.notification_service.event.InventoryUpdatedEvent;
import com.smartfood.notification_service.event.OrderStatusChangedEvent;
import com.smartfood.notification_service.event.PriceUpdatedEvent;
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
        // Use topic scoped to userId instead of user queue
        String destination = "/topic/orders/" + event.getUserId();

        log.info("Broadcasting order update to {}: orderId={}, status={}",
                destination, event.getOrderId(), event.getNewStatus());

        messagingTemplate.convertAndSend(destination, event);
    }

    public void broadcastPriceUpdate(PriceUpdatedEvent event) {
        messagingTemplate.convertAndSend(
                "/topic/bags/" + event.getBagId() + "/price",
                event
        );
    }
}