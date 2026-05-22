package com.smartfood.order_service.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class OrderConfirmedEvent {
    private Long orderId;
    private Long userId;
    private Long bagId;
    private BigDecimal totalPrice;
}