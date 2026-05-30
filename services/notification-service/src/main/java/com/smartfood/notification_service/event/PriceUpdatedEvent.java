package com.smartfood.notification_service.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdatedEvent {
    private Long bagId;
    private BigDecimal newDiscount;
}