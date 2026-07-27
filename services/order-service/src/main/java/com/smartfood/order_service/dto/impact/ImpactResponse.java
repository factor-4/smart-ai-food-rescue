package com.smartfood.order_service.dto.impact;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ImpactResponse {
    private long mealsSaved;
    private BigDecimal moneySaved;
    private double co2PreventedKg;
}