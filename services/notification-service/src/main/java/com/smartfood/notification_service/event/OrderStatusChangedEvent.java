package com.smartfood.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusChangedEvent {
    private Long orderId;
    private Long userId;
    private Long bagId;
    private String oldStatus;
    private String newStatus;
    private String message;
}