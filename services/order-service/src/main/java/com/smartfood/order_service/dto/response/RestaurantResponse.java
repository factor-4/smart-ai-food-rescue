package com.smartfood.order_service.dto.response;

import lombok.Data;

@Data
public class RestaurantResponse {
    private Long id;
    private String name;
    private Long ownerId;
}