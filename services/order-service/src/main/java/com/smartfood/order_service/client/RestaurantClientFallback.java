package com.smartfood.order_service.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RestaurantClientFallback implements RestaurantClient {

    @Override
    public void reserveInventory(Long bagId, Integer quantity) {
        log.error("Circuit breaker open: Cannot reserve inventory for bag {} quantity {}", bagId, quantity);
        throw new RuntimeException("Restaurant Service is unavailable. Could not reserve inventory.");
    }

    @Override
    public void releaseInventory(Long bagId, Integer quantity) {
        log.error("Circuit breaker open: Cannot release inventory for bag {} quantity {}", bagId, quantity);
        throw new RuntimeException("Restaurant Service is unavailable. Could not release inventory.");
    }
}