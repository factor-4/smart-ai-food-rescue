package com.smartfood.restaurant_service.repository;

import com.smartfood.restaurant_service.domain.entity.Bag;
import com.smartfood.restaurant_service.domain.model.BagStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BagRepository extends JpaRepository<Bag, Long> {


    List<Bag> findByRestaurantId(Long restaurantId);


    Page<Bag> findByRestaurantIdAndStatus(
            Long restaurantId,
            BagStatus status,
            Pageable pageable
    );


    Page<Bag> findByStatus(BagStatus status, Pageable pageable);


    Optional<Bag> findByIdAndRestaurantId(Long id, Long restaurantId);


    @Query("SELECT b FROM Bag b WHERE b.restaurant.ownerId = :ownerId")
    List<Bag> findAllBagsByOwnerId(@Param("ownerId") Long ownerId);
}