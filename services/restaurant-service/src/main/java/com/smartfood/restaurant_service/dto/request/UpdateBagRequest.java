package com.smartfood.restaurant_service.dto.request;

import com.smartfood.restaurant_service.domain.model.BagStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class UpdateBagRequest {

    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 1000)
    private String description;

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal originalPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal discountedPrice;

    @Min(1) @Max(100)
    private Integer quantity;

    @Future
    private LocalDateTime pickupTime;

    private BagStatus status;
}