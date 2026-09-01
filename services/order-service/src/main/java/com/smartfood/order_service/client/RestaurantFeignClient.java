package com.smartfood.order_service.client;

import com.smartfood.order_service.dto.response.RestaurantResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "restaurant-service", path = "/api/restaurants", contextId = "restaurantFeignClient")
public interface RestaurantFeignClient {

    @GetMapping("/{restaurantId}")
    RestaurantResponse getRestaurantById(@PathVariable Long restaurantId);
}