package com.smartfood.notification_service.event;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdatedEvent {
    private Long bagId;
    private Long restaurantId;
    private Integer availableQuantity;
    private String bagName;
    private String status; // "AVAILABLE", "SOLD_OUT"
}