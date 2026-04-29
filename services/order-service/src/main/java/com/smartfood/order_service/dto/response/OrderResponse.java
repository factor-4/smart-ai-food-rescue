package com.smartfood.order_service.dto.response;

import com.smartfood.order_service.domain.Order;
import com.smartfood.order_service.domain.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String idempotencyKey;
    private Long userId;
    private Long bagId;
    private Integer quantity;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private LocalDateTime createdAt;

    public static OrderResponse fromEntity(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .idempotencyKey(order.getIdempotencyKey())
                .userId(order.getUserId())
                .bagId(order.getBagId())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }
}