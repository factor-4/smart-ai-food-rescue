package com.smartfood.restaurant_service.controller;

import com.smartfood.restaurant_service.dto.request.CreateRestaurantRequest;
import com.smartfood.restaurant_service.dto.request.UpdateRestaurantRequest;
import com.smartfood.restaurant_service.dto.response.RestaurantResponse;
import com.smartfood.restaurant_service.service.RestaurantService;
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
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    /*
     * POST /api/restaurants
     * Only ROLE_OWNER can create restaurants.
     *
     * authentication.getPrincipal() returns the userId (Long)
     * that we set in JwtAuthenticationFilter.
     * We pass it to the service as ownerId.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request,
            Authentication authentication) {

        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(restaurantService.createRestaurant(request, ownerId));
    }

    /*
     * GET /api/restaurants?page=0&size=10
     * Public — no token needed.
     */
    @GetMapping
    public ResponseEntity<Page<RestaurantResponse>> getRestaurants(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(
                restaurantService.getActiveRestaurants(pageable));
    }

    /*
     * GET /api/restaurants/my
     * Owner sees their own restaurants.
     * /my must be defined BEFORE /{id}
     * otherwise Spring matches "my" as an id.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(
                restaurantService.getMyRestaurants(ownerId));
    }

    /*
     * GET /api/restaurants/{id}
     * Public — anyone can view a restaurant.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                restaurantService.getRestaurantById(id));
    }

    /*
     * PUT /api/restaurants/{id}
     * Owner only — update their restaurant.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRestaurantRequest request,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(
                restaurantService.updateRestaurant(id, request, ownerId));
    }

    /*
     * DELETE /api/restaurants/{id}
     * Owner only.
     * 204 No Content — success with no response body.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_OWNER')")
    public ResponseEntity<Void> deleteRestaurant(
            @PathVariable Long id,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        restaurantService.deleteRestaurant(id, ownerId);
        return ResponseEntity.noContent().build();
    }
}