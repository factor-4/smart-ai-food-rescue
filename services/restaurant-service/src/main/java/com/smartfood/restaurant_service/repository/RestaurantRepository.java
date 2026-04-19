package com.smartfood.restaurant_service.repository;

import com.smartfood.restaurant_service.domain.entity.Restaurant;
import com.smartfood.restaurant_service.domain.model.RestaurantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {


    List<Restaurant> findByOwnerId(Long ownerId);


    Page<Restaurant> findByStatus(RestaurantStatus status, Pageable pageable);

    boolean existsByNameAndOwnerId(String name, Long ownerId);


    Optional<Restaurant> findByIdAndOwnerId(Long id, Long ownerId);
}