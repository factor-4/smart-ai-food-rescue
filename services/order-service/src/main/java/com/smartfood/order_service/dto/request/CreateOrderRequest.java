package com.smartfood.order_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull
    private String idempotencyKey;

    @NotNull
    private Long userId;          // temporary – later from JWT

    @NotNull
    private Long bagId;

    @Positive
    private Integer quantity;
}