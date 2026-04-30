package com.smartfood.order_service.client;

import com.smartfood.order_service.dto.BagInfo;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "restaurant-service", path = "/api/bags")
public interface RestaurantClient {

    @PostMapping("/{bagId}/reserve")
    void reserveInventory(@PathVariable Long bagId, @RequestParam Integer quantity);

    @PostMapping("/{bagId}/release")
    void releaseInventory(@PathVariable Long bagId, @RequestParam Integer quantity);

    @GetMapping("/{bagId}")
    BagInfo getBag(@PathVariable Long bagId);
}