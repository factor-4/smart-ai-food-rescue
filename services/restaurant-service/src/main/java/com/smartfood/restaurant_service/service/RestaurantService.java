package com.smartfood.restaurant_service.service;

import com.smartfood.restaurant_service.domain.entity.Restaurant;
import com.smartfood.restaurant_service.domain.model.RestaurantStatus;
import com.smartfood.restaurant_service.dto.request.CreateRestaurantRequest;
import com.smartfood.restaurant_service.dto.request.UpdateRestaurantRequest;
import com.smartfood.restaurant_service.dto.response.RestaurantResponse;
import com.smartfood.restaurant_service.exception.DuplicateResourceException;
import com.smartfood.restaurant_service.exception.ResourceNotFoundException;
import com.smartfood.restaurant_service.exception.UnauthorizedException;
import com.smartfood.restaurant_service.mapper.RestaurantMapper;
import com.smartfood.restaurant_service.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final RestaurantMapper restaurantMapper;


    @Transactional
    public RestaurantResponse createRestaurant(
            CreateRestaurantRequest request, Long ownerId) {

        /*
         * Ownership + duplicate check.
         * Same owner cannot have two restaurants with the same name.
         * Different owners CAN have same name (different businesses).
         */
        if (restaurantRepository.existsByNameAndOwnerId(
                request.getName(), ownerId)) {
            throw new DuplicateResourceException(
                    "You already have a restaurant named: " + request.getName()
            );
        }

        Restaurant restaurant = restaurantMapper.toEntity(request, ownerId);
        Restaurant saved = restaurantRepository.save(restaurant);
        return restaurantMapper.toResponse(saved);
    }

    /*
     * Public listing — anyone can browse active restaurants.
     * Returns a Page (paginated) not a List (all records).

     */
    @Transactional(readOnly = true)
    public Page<RestaurantResponse> getActiveRestaurants(Pageable pageable) {
        return restaurantRepository
                .findByStatus(RestaurantStatus.ACTIVE, pageable)
                .map(restaurantMapper::toResponse);

    }

    /*
     * Owner sees their own restaurants (all statuses).
     */
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getMyRestaurants(Long ownerId) {
        return restaurantRepository
                .findByOwnerId(ownerId)
                .stream()
                .map(restaurantMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        return restaurantMapper.toResponse(restaurant);
    }

    @Transactional
    public RestaurantResponse updateRestaurant(
            Long id, UpdateRestaurantRequest request, Long ownerId) {

        /*
         * We find by BOTH id AND ownerId.
         * If the restaurant exists but belongs to someone else,
         * this returns empty — same as not found.
         *

         */
        Restaurant restaurant = restaurantRepository
                .findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Restaurant not found or you don't have permission"
                ));

        restaurantMapper.updateEntity(restaurant, request);

        return restaurantMapper.toResponse(restaurant);
    }

    @Transactional
    public void deleteRestaurant(Long id, Long ownerId) {
        Restaurant restaurant = restaurantRepository
                .findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Restaurant not found or you don't have permission"
                ));


        restaurantRepository.delete(restaurant);
    }


    private Restaurant findRestaurantOrThrow(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Restaurant not found with id: " + id
                ));
    }
}