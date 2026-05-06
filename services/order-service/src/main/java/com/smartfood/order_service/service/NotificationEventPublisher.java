package com.smartfood.order_service.service;

import com.smartfood.order_service.event.InventoryUpdatedEvent;
import com.smartfood.order_service.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishInventoryUpdate(InventoryUpdatedEvent event) {
        try {
            kafkaTemplate.send("inventory-updated",
                    event.getBagId().toString(), event);
            log.info("Published inventory update for bagId={}", event.getBagId());
        } catch (Exception e) {
            log.error("Failed to publish inventory update: {}", e.getMessage(), e);
        }
    }

    public void publishOrderStatusChange(OrderStatusChangedEvent event) {
        try {
            kafkaTemplate.send("order-status-changed",
                    event.getOrderId().toString(), event);
            log.info("Published order status change for orderId={}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish order status change: {}", e.getMessage(), e);
        }
    }


}