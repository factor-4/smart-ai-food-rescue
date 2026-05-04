package com.smartfood.notification_service.kafka;


import com.smartfood.notification_service.event.InventoryUpdatedEvent;
import com.smartfood.notification_service.event.OrderStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryEventConsumer {

    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(
            topics = "inventory-updated",
            groupId = "notification-service-group"
    )
    public void consumeInventoryUpdate(
            @Payload InventoryUpdatedEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Consumed inventory event from topic={}, partition={}, offset={}: bagId={}",
                topic, partition, offset, event.getBagId());

        try {
            redisTemplate.convertAndSend("inventory-updates", event);
            log.info("Published inventory event to Redis for bagId={}", event.getBagId());

        } catch (Exception e) {
            log.error("Failed to publish inventory event to Redis: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(
            topics = "order-status-changed",
            groupId = "notification-service-group"
    )
    public void consumeOrderStatusChange(
            @Payload OrderStatusChangedEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Consumed order status event from topic={}, partition={}, offset={}: orderId={}",
                topic, partition, offset, event.getOrderId());

        try {
            redisTemplate.convertAndSend("order-status-updates", event);
            log.info("Published order status event to Redis for orderId={}", event.getOrderId());

        } catch (Exception e) {
            log.error("Failed to publish order status event to Redis: {}", e.getMessage(), e);
        }
    }
}
