package com.smartfood.order_service.service;

import com.smartfood.order_service.client.RestaurantServiceClient;
import com.smartfood.order_service.domain.Order;
import com.smartfood.order_service.domain.OrderStatus;
import com.smartfood.order_service.event.*;
import com.smartfood.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SagaOrchestrator {

    private final OrderRepository orderRepository;
    private final RestaurantServiceClient restaurantServiceClient;
    private final KafkaEventPublisher eventPublisher;
    private final NotificationEventPublisher notificationEventPublisher;

    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public void executeSaga(Order order) {
        log.info("Starting saga for order {}", order.getId());

        try {
            // ----- Step 1: Reserve inventory -----
            restaurantServiceClient.reserveInventory(order.getBagId(), order.getQuantity());
            order.setStatus(OrderStatus.RESERVED);
            orderRepository.save(order);
            publishEvent(new InventoryReservedEvent(order.getId(), true));
            log.info("Inventory reserved for order {}", order.getId());

            // ----- Step 2: Process payment (mock) -----
            mockPayment(order);
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
            publishEvent(new PaymentProcessedEvent(order.getId(), true));
            log.info("Payment processed for order {}", order.getId());

            // ----- Step 3: Confirm order -----
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
            log.info("Order {} confirmed", order.getId());

            // ----- Record purchase via MCP -----
            applicationEventPublisher.publishEvent(new OrderConfirmedEvent(
                    order.getId(),
                    order.getUserId(),
                    order.getBagId(),
                    order.getTotalPrice()
            ));

            //  notify user that order is confirmed
            notificationEventPublisher.publishOrderStatusChange(
                    new OrderStatusChangedEvent(
                            order.getId(),
                            order.getUserId(),
                            order.getBagId(),
                            "PENDING",
                            "CONFIRMED",
                            "🎉 Your order has been confirmed!"
                    )
            );



        } catch (Exception e) {
            log.error("Saga failed for order {}: {}", order.getId(), e.getMessage());
            compensate(order, e.getMessage());
        }
    }

    private void compensate(Order order, String reason) {
        OrderStatus status = order.getStatus();

        if (status == OrderStatus.RESERVED || status == OrderStatus.PAID) {
            try {
                restaurantServiceClient.releaseInventory(order.getBagId(), order.getQuantity());
                publishEvent(new InventoryReleasedEvent(order.getId(), true));
                log.info("Compensation: inventory released for order {}", order.getId());
            } catch (Exception ex) {
                log.error("Compensation failed to release inventory for order {}", order.getId(), ex);
                publishEvent(new InventoryReleasedEvent(order.getId(), false));
            }
        }

        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
        publishEvent(new OrderFailedEvent(order.getId(), reason));
        log.info("Order {} marked as FAILED", order.getId());

        //  notify user that order failed
        notificationEventPublisher.publishOrderStatusChange(
                new OrderStatusChangedEvent(
                        order.getId(),
                        order.getUserId(),
                        order.getBagId(),
                        "PENDING",
                        "FAILED",
                        "❌ Your order failed: " + reason
                )
        );
    }

    private void mockPayment(Order order) {
        log.debug("Mock payment succeeded for order {}", order.getId());
    }

    private void publishEvent(Object event) {
        try {
            if (event instanceof InventoryReservedEvent e) {
                eventPublisher.publishInventoryReserved(e);
            } else if (event instanceof PaymentProcessedEvent e) {
                eventPublisher.publishPaymentProcessed(e);
            } else if (event instanceof OrderFailedEvent e) {
                eventPublisher.publishOrderFailed(e);
            } else if (event instanceof InventoryReleasedEvent e) {
                eventPublisher.publishInventoryReleased(e);
            }
        } catch (Exception e) {
            log.warn("Could not publish event {}: {}", event.getClass().getSimpleName(), e.getMessage());
        }
    }
}