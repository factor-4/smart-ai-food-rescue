package com.smartfood.restaurant_service.mapper;

import com.smartfood.restaurant_service.domain.entity.Bag;
import com.smartfood.restaurant_service.domain.entity.Restaurant;
import com.smartfood.restaurant_service.dto.request.CreateBagRequest;
import com.smartfood.restaurant_service.dto.request.UpdateBagRequest;
import com.smartfood.restaurant_service.dto.response.BagResponse;
import org.springframework.stereotype.Component;

@Component
public class BagMapper {

    public Bag toEntity(CreateBagRequest request, Restaurant restaurant) {
        return Bag.builder()
                .name(request.getName())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .discountedPrice(request.getDiscountedPrice())
                .quantity(request.getQuantity())
                .pickupTime(request.getPickupTime())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .restaurant(restaurant)
                .build();
    }

    public BagResponse toResponse(Bag bag) {
        return BagResponse.builder()
                .id(bag.getId())
                .name(bag.getName())
                .description(bag.getDescription())
                .originalPrice(bag.getOriginalPrice())
                .discountedPrice(bag.getDiscountedPrice())
                .quantity(bag.getQuantity())
                .pickupTime(bag.getPickupTime())
                .latitude(bag.getLatitude())
                .longitude(bag.getLongitude())
                .status(bag.getStatus())
                .restaurantId(bag.getRestaurant().getId())
                .restaurantName(bag.getRestaurant().getName())
                .createdAt(bag.getCreatedAt())
                .updatedAt(bag.getUpdatedAt())
                .build();
    }

    public void updateEntity(Bag bag, UpdateBagRequest request) {
        if (request.getName() != null) bag.setName(request.getName());
        if (request.getDescription() != null) bag.setDescription(request.getDescription());
        if (request.getOriginalPrice() != null) bag.setOriginalPrice(request.getOriginalPrice());
        if (request.getDiscountedPrice() != null) bag.setDiscountedPrice(request.getDiscountedPrice());
        if (request.getQuantity() != null) bag.setQuantity(request.getQuantity());
        if (request.getLatitude() != null) bag.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) bag.setLongitude(request.getLongitude());
        if (request.getPickupTime() != null) bag.setPickupTime(request.getPickupTime());
        if (request.getStatus() != null) bag.setStatus(request.getStatus());
    }
}