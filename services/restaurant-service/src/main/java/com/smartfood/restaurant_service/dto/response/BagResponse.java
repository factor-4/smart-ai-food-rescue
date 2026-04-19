package com.smartfood.restaurant_service.dto.response;

import com.smartfood.restaurant_service.domain.model.BagStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BagResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal discountedPrice;
    private Integer quantity;
    private LocalDateTime pickupTime;
    private BagStatus status;
    private Long restaurantId;      // client needs to know which restaurant
    private String restaurantName;  // convenient — saves an extra API call
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}