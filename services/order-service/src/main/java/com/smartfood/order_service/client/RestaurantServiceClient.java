package com.smartfood.order_service.client;

import com.smartfood.order_service.dto.BagInfo;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RestaurantServiceClient {

    private final RestaurantClient restaurantClient;

    @CircuitBreaker(name = "restaurantService", fallbackMethod = "getBagFallback")
    public BagInfo getBag(Long bagId) {
        return restaurantClient.getBag(bagId);
    }

    @CircuitBreaker(name = "restaurantService", fallbackMethod = "reserveInventoryFallback")
    public void reserveInventory(Long bagId, Integer quantity) {
        restaurantClient.reserveInventory(bagId, quantity);
    }

    @CircuitBreaker(name = "restaurantService", fallbackMethod = "releaseInventoryFallback")
    public void releaseInventory(Long bagId, Integer quantity) {
        restaurantClient.releaseInventory(bagId, quantity);
    }

    // Fallback methods – must have the same parameters plus a Throwable
    private BagInfo getBagFallback(Long bagId, Throwable t) {
        throw new RuntimeException("Circuit open or call failed for getBag", t);
    }

    private void reserveInventoryFallback(Long bagId, Integer quantity, Throwable t) {
        throw new RuntimeException("Circuit open or call failed for reserveInventory", t);
    }

    private void releaseInventoryFallback(Long bagId, Integer quantity, Throwable t) {
        throw new RuntimeException("Circuit open or call failed for releaseInventory", t);
    }
}