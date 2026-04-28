package com.smartfood.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "restaurant-service", path = "/api/bags", fallback = RestaurantClientFallback.class)
public interface RestaurantClient {

    @PostMapping("/{bagId}/reserve")
    void reserveInventory(@PathVariable Long bagId, @RequestParam Integer quantity);

    @PostMapping("/{bagId}/release")
    void releaseInventory(@PathVariable Long bagId, @RequestParam Integer quantity);
}