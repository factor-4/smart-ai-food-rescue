package com.smartfood.order_service.service;

import com.smartfood.order_service.domain.Order;
import com.smartfood.order_service.domain.OrderStatus;
import com.smartfood.order_service.event.OrderCreatedEvent;
import com.smartfood.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SagaEventConsumer {

    private final OrderRepository orderRepository;
    private final SagaOrchestrator sagaOrchestrator;

    @KafkaListener(topics = "${app.kafka.topics.order-created}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received OrderCreatedEvent for orderId={}", event.getOrderId());
        orderRepository.findById(event.getOrderId()).ifPresentOrElse(
                order -> {
                    if (order.getStatus() == OrderStatus.PENDING) {
                        sagaOrchestrator.executeSaga(order);
                    } else {
                        log.info("Order {} already processed (status = {}), skipping saga", order.getId(), order.getStatus());
                    }
                },
                () -> log.error("Order not found for id {}", event.getOrderId())
        );
    }
}