package com.smartfood.notification_service.kafka;

import com.smartfood.notification_service.event.PriceUpdatedEvent;
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
public class PriceEventConsumer {

    private final RedisTemplate<String, Object> redisTemplate;

    @KafkaListener(
            topics = "price-updated",
            groupId = "notification-service-group",
            properties = {
                    "spring.json.use.type.headers=false",
                    "spring.json.value.default.type=com.smartfood.notification_service.event.PriceUpdatedEvent"
            }
    )
    public void consumePriceUpdate(
            @Payload PriceUpdatedEvent event,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("Consumed price event from topic={}, partition={}, offset={}: bagId={}, newDiscount={}",
                topic, partition, offset, event.getBagId(), event.getNewDiscount());

        try {
            redisTemplate.convertAndSend("price-updates", event);
            log.info("Published price event to Redis for bagId={}", event.getBagId());
        } catch (Exception e) {
            log.error("Failed to publish price event to Redis: {}", e.getMessage(), e);
        }
    }
}