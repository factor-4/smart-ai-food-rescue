package com.smartfood.order_service.service;

import com.smartfood.order_service.client.RestaurantClient;
import com.smartfood.order_service.client.RestaurantServiceClient;
import com.smartfood.order_service.domain.Order;
import com.smartfood.order_service.domain.OrderStatus;
import com.smartfood.order_service.dto.BagInfo;
import com.smartfood.order_service.dto.request.CreateOrderRequest;
import com.smartfood.order_service.dto.response.OrderResponse;
import com.smartfood.order_service.event.OrderCreatedEvent;
import com.smartfood.order_service.exception.InsufficientInventoryException;
import com.smartfood.order_service.exception.ResourceNotFoundException;
import com.smartfood.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantServiceClient restaurantServiceClient;
    private final KafkaEventPublisher eventPublisher;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
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
        BigDecimal price = bagInfo.getDiscountedPrice() != null ? bagInfo.getDiscountedPrice() : bagInfo.getOriginalPrice();
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

        // 4. Publish event to Kafka
        OrderCreatedEvent event = new OrderCreatedEvent(
                order.getId(),
                order.getUserId(),
                order.getBagId(),
                order.getQuantity(),
                order.getTotalPrice(),
                order.getIdempotencyKey()
        );
        eventPublisher.publishOrderCreated(event);

        return OrderResponse.fromEntity(order);
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return OrderResponse.fromEntity(order);
    }
}