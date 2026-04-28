package com.smartfood.order_service.service;

import com.smartfood.order_service.config.OrderServiceProperties;
import com.smartfood.order_service.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final OrderServiceProperties properties;

    public void publishOrderCreated(OrderCreatedEvent event) {
        String topic = properties.getKafka().getTopics().getOrderCreated();
        String key = event.getOrderId().toString();
        kafkaTemplate.send(topic, key, event);
        log.debug("Published OrderCreatedEvent to {}: {}", topic, event);
    }

    public void publishInventoryReserved(InventoryReservedEvent event) {
        String topic = properties.getKafka().getTopics().getInventoryReserved();
        String key = event.getOrderId().toString();
        kafkaTemplate.send(topic, key, event);
        log.debug("Published InventoryReservedEvent to {}: {}", topic, event);
    }

    public void publishPaymentProcessed(PaymentProcessedEvent event) {
        String topic = properties.getKafka().getTopics().getPaymentProcessed();
        String key = event.getOrderId().toString();
        kafkaTemplate.send(topic, key, event);
        log.debug("Published PaymentProcessedEvent to {}: {}", topic, event);
    }

    public void publishOrderFailed(OrderFailedEvent event) {
        String topic = properties.getKafka().getTopics().getOrderFailed();
        String key = event.getOrderId().toString();
        kafkaTemplate.send(topic, key, event);
        // Also send to Dead Letter Queue
        String dlqTopic = properties.getKafka().getTopics().getOrderFailedDlq();
        kafkaTemplate.send(dlqTopic, key, event);
        log.info("Published OrderFailedEvent to {} and DLQ {}", topic, dlqTopic);
    }

    public void publishInventoryReleased(InventoryReleasedEvent event) {
        String topic = properties.getKafka().getTopics().getInventoryReleased();
        String key = event.getOrderId().toString();
        kafkaTemplate.send(topic, key, event);
        log.debug("Published InventoryReleasedEvent to {}: {}", topic, event);
    }
}