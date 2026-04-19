package com.smartfood.restaurant_service.mapper;

import com.smartfood.restaurant_service.domain.entity.Restaurant;
import com.smartfood.restaurant_service.dto.request.CreateRestaurantRequest;
import com.smartfood.restaurant_service.dto.request.UpdateRestaurantRequest;
import com.smartfood.restaurant_service.dto.response.RestaurantResponse;
import org.springframework.stereotype.Component;


@Component
public class RestaurantMapper {


    public Restaurant toEntity(CreateRestaurantRequest request, Long ownerId) {
        return Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .ownerId(ownerId)
                .build();
    }


    public RestaurantResponse toResponse(Restaurant restaurant) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .email(restaurant.getEmail())
                .ownerId(restaurant.getOwnerId())
                .status(restaurant.getStatus())
                .createdAt(restaurant.getCreatedAt())
                .updatedAt(restaurant.getUpdatedAt())
                .build();
    }


    public void updateEntity(Restaurant restaurant, UpdateRestaurantRequest request) {
        if (request.getName() != null) {
            restaurant.setName(request.getName());
        }
        if (request.getDescription() != null) {
            restaurant.setDescription(request.getDescription());
        }
        if (request.getAddress() != null) {
            restaurant.setAddress(request.getAddress());
        }
        if (request.getPhone() != null) {
            restaurant.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            restaurant.setEmail(request.getEmail());
        }
        if (request.getStatus() != null) {
            restaurant.setStatus(request.getStatus());
        }
    }
}