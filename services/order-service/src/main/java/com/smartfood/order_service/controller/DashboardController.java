package com.smartfood.order_service.controller;

import com.smartfood.order_service.dto.response.DashboardResponse;
import com.smartfood.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrderService orderService;

    @GetMapping("/{restaurantId}")
    public ResponseEntity<DashboardResponse> getDashboard(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getDashboard(restaurantId));
    }
}