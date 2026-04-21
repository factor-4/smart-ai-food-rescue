package com.smartfood.restaurant_service.controller;

import com.smartfood.restaurant_service.dto.request.CreateBagRequest;
import com.smartfood.restaurant_service.dto.request.UpdateBagRequest;
import com.smartfood.restaurant_service.dto.response.BagResponse;
import com.smartfood.restaurant_service.service.BagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BagController {

    private final BagService bagService;

    /*
     * POST /api/restaurants/{restaurantId}/bags
     * Nested URL — bag always belongs to a restaurant.
     * Owner only.
     */
    @PostMapping("/api/restaurants/{restaurantId}/bags")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<BagResponse> createBag(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CreateBagRequest request,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bagService.createBag(restaurantId, request, ownerId));
    }

    /*
     * GET /api/bags?page=0&size=10
     * Public — all available bags across all restaurants.
     */
    @GetMapping("/api/bags")
    public ResponseEntity<Page<BagResponse>> getAvailableBags(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(bagService.getAvailableBags(pageable));
    }

    /*
     * GET /api/restaurants/{restaurantId}/bags
     * Public — bags for one specific restaurant.
     */
    @GetMapping("/api/restaurants/{restaurantId}/bags")
    public ResponseEntity<Page<BagResponse>> getBagsByRestaurant(
            @PathVariable Long restaurantId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                bagService.getBagsByRestaurant(restaurantId, pageable));
    }

    /*
     * GET /api/bags/my
     * Owner sees all their bags across all restaurants.
     */
    @GetMapping("/api/bags/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<BagResponse>> getMyBags(
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(bagService.getMyBags(ownerId));
    }

    /*
     * PUT /api/restaurants/{restaurantId}/bags/{bagId}
     * Owner only — update a specific bag.
     */
    @PutMapping("/api/restaurants/{restaurantId}/bags/{bagId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<BagResponse> updateBag(
            @PathVariable Long restaurantId,
            @PathVariable Long bagId,
            @Valid @RequestBody UpdateBagRequest request,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(
                bagService.updateBag(restaurantId, bagId, request, ownerId));
    }

    /*
     * DELETE /api/restaurants/{restaurantId}/bags/{bagId}
     * Owner only.
     */
    @DeleteMapping("/api/restaurants/{restaurantId}/bags/{bagId}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<Void> deleteBag(
            @PathVariable Long restaurantId,
            @PathVariable Long bagId,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        bagService.deleteBag(restaurantId, bagId, ownerId);
        return ResponseEntity.noContent().build();
    }
}