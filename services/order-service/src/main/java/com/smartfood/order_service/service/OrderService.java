package com.smartfood.order_service.service;

import com.smartfood.order_service.client.RestaurantClient;
import com.smartfood.order_service.client.RestaurantServiceClient;
import com.smartfood.order_service.domain.Order;
import com.smartfood.order_service.domain.OrderStatus;
import com.smartfood.order_service.dto.BagInfo;
import com.smartfood.order_service.dto.request.CreateOrderRequest;
import com.smartfood.order_service.dto.response.OrderResponse;
import com.smartfood.order_service.event.InventoryUpdatedEvent;
import com.smartfood.order_service.event.OrderCreatedEvent;
import com.smartfood.order_service.event.OrderStatusChangedEvent;
import com.smartfood.order_service.exception.InsufficientInventoryException;
import com.smartfood.order_service.exception.ResourceNotFoundException;
import com.smartfood.order_service.repository.OrderRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantServiceClient restaurantServiceClient;
    private final KafkaEventPublisher eventPublisher;
    private final NotificationEventPublisher notificationEventPublisher;
    private final MeterRegistry meterRegistry;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        meterRegistry.counter("orders.attempts").increment();

        try {
            // 1. Idempotency check
            Optional<Order> existing = orderRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Returning existing order for idempotencyKey: {}", request.getIdempotencyKey());
                return OrderResponse.fromEntity(existing.get());
            }

            // 2. Get bag details (price and availability)
            BagInfo bagInfo = restaurantServiceClient.getBag(request.getBagId());
            if (bagInfo == null || !"AVAILABLE".equals(bagInfo.getStatus())) {
                throw new ResourceNotFoundException("Bag not available");
            }
            if (bagInfo.getQuantity() < request.getQuantity()) {
                throw new InsufficientInventoryException("Not enough bags available");
            }
            BigDecimal price = bagInfo.getDiscountedPrice() != null
                    ? bagInfo.getDiscountedPrice()
                    : bagInfo.getOriginalPrice();
            BigDecimal total = price.multiply(BigDecimal.valueOf(request.getQuantity()));

            // 3. Create order
            Order order = Order.builder()
                    .idempotencyKey(request.getIdempotencyKey())
                    .userId(request.getUserId())
                    .bagId(request.getBagId())
                    .quantity(request.getQuantity())
                    .totalPrice(total)
                    .status(OrderStatus.PENDING)
                    .build();
            order = orderRepository.save(order);
            log.info("Order created with id: {}", order.getId());

            meterRegistry.counter("orders.created").increment();

            // 4. Publish saga event to Kafka
            OrderCreatedEvent event = new OrderCreatedEvent(
                    order.getId(),
                    order.getUserId(),
                    order.getBagId(),
                    order.getQuantity(),
                    order.getTotalPrice(),
                    order.getIdempotencyKey()
            );
            eventPublisher.publishOrderCreated(event);

            // 5. Publish order status notification
            OrderStatusChangedEvent statusEvent = new OrderStatusChangedEvent(
                    order.getId(),
                    order.getUserId(),
                    order.getBagId(),
                    null,
                    "PENDING",
                    "Your order has been placed successfully!"
            );
            notificationEventPublisher.publishOrderStatusChange(statusEvent);

            // 6. Publish inventory update notification
            int remainingQuantity = bagInfo.getQuantity() - request.getQuantity();
            InventoryUpdatedEvent inventoryEvent = new InventoryUpdatedEvent(
                    bagInfo.getId(),
                    bagInfo.getRestaurantId(),
                    remainingQuantity,
                    bagInfo.getName(),
                    remainingQuantity > 0 ? "AVAILABLE" : "SOLD_OUT"
            );
            notificationEventPublisher.publishInventoryUpdate(inventoryEvent);

            return OrderResponse.fromEntity(order);

        } catch (Exception e) {
            meterRegistry.counter("orders.failed").increment();
            log.error("Order creation failed for idempotencyKey: {}", request.getIdempotencyKey(), e);
            throw e;
        }
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return OrderResponse.fromEntity(order);
    }

    public List<OrderResponse> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(OrderResponse::fromEntity)
                .toList();
    }
}