package com.smartfood.order_service.dto.request;

import com.smartfood.order_service.domain.OrderStatus;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    private OrderStatus status;
}