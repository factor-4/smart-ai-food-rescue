package com.smartfood.order_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BagInfo {
    private Long id;
    private BigDecimal originalPrice;
    private BigDecimal discountedPrice;
    private Integer quantity;
    private String status;
}