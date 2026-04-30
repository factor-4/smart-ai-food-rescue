package com.smartfood.restaurant_service.service;

import com.smartfood.restaurant_service.domain.entity.Bag;
import com.smartfood.restaurant_service.domain.entity.Restaurant;
import com.smartfood.restaurant_service.domain.model.BagStatus;
import com.smartfood.restaurant_service.dto.request.CreateBagRequest;
import com.smartfood.restaurant_service.dto.request.UpdateBagRequest;
import com.smartfood.restaurant_service.dto.response.BagResponse;
import com.smartfood.restaurant_service.exception.ResourceNotFoundException;
import com.smartfood.restaurant_service.exception.UnauthorizedException;
import com.smartfood.restaurant_service.mapper.BagMapper;
import com.smartfood.restaurant_service.repository.BagRepository;
import com.smartfood.restaurant_service.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BagService {

    private final BagRepository bagRepository;
    private final RestaurantRepository restaurantRepository;
    private final BagMapper bagMapper;

    @Transactional
    public BagResponse createBag(
            Long restaurantId,
            CreateBagRequest request,
            Long ownerId) {

        /*
         * Ownership check — verify the restaurant belongs to this owner.
         * If it doesn't, we throw UnauthorizedException.
         * We never let someone add bags to another owner's restaurant.
         */
        Restaurant restaurant = restaurantRepository
                .findByIdAndOwnerId(restaurantId, ownerId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Restaurant not found or you don't have permission"
                ));

        Bag bag = bagMapper.toEntity(request, restaurant);
        Bag saved = bagRepository.save(bag);
        return bagMapper.toResponse(saved);
    }

    /*
     * Public endpoint — all available bags across all restaurants.
     * Customers browse this to find rescue bags near them.
     */
    @Transactional(readOnly = true)
    public Page<BagResponse> getAvailableBags(Pageable pageable) {
        return bagRepository
                .findByStatus(BagStatus.AVAILABLE, pageable)
                .map(bagMapper::toResponse);
    }

    /*
     * Get bags for a specific restaurant — public.
     * Only shows AVAILABLE bags to the public.
     */
    @Transactional(readOnly = true)
    public Page<BagResponse> getBagsByRestaurant(
            Long restaurantId, Pageable pageable) {

        // First verify the restaurant exists
        if (!restaurantRepository.existsById(restaurantId)) {
            throw new ResourceNotFoundException(
                    "Restaurant not found with id: " + restaurantId
            );
        }

        return bagRepository
                .findByRestaurantIdAndStatus(
                        restaurantId, BagStatus.AVAILABLE, pageable)
                .map(bagMapper::toResponse);
    }

    /*
     * Owner sees ALL their bags (all statuses) across all restaurants.
     */
    @Transactional(readOnly = true)
    public List<BagResponse> getMyBags(Long ownerId) {
        return bagRepository
                .findAllBagsByOwnerId(ownerId)
                .stream()
                .map(bagMapper::toResponse)
                .toList();
    }

    @Transactional
    public BagResponse updateBag(
            Long restaurantId,
            Long bagId,
            UpdateBagRequest request,
            Long ownerId) {

        // Verify restaurant ownership
        restaurantRepository
                .findByIdAndOwnerId(restaurantId, ownerId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Restaurant not found or you don't have permission"
                ));

        // Verify bag belongs to this restaurant
        Bag bag = bagRepository
                .findByIdAndRestaurantId(bagId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bag not found with id: " + bagId
                ));

        bagMapper.updateEntity(bag, request);

        /*
         * Business rule: if quantity hits 0, automatically mark SOLD_OUT.

         */
        if (bag.getQuantity() != null && bag.getQuantity() == 0) {
            bag.setStatus(BagStatus.SOLD_OUT);
        }

        return bagMapper.toResponse(bag);
    }

    @Transactional
    public void deleteBag(Long restaurantId, Long bagId, Long ownerId) {
        restaurantRepository
                .findByIdAndOwnerId(restaurantId, ownerId)
                .orElseThrow(() -> new UnauthorizedException(
                        "Restaurant not found or you don't have permission"
                ));

        Bag bag = bagRepository
                .findByIdAndRestaurantId(bagId, restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bag not found with id: " + bagId
                ));

        bagRepository.delete(bag);
    }

    @Transactional
    public void reserve(Long bagId, int quantity) {
        Bag bag = bagRepository.findById(bagId)
                .orElseThrow(() -> new ResourceNotFoundException("Bag not found with id: " + bagId));
        if (bag.getQuantity() < quantity) {
            throw new ResourceNotFoundException("Not enough bags available");
        }
        bag.setQuantity(bag.getQuantity() - quantity);
        bagRepository.save(bag);
    }

    @Transactional
    public void release(Long bagId, int quantity) {
        Bag bag = bagRepository.findById(bagId)
                .orElseThrow(() -> new ResourceNotFoundException("Bag not found with id: " + bagId));
        bag.setQuantity(bag.getQuantity() + quantity);
        bagRepository.save(bag);
    }

    public BagResponse getBagById(Long bagId) {
        Bag bag = bagRepository.findById(bagId)
                .orElseThrow(() -> new ResourceNotFoundException("Bag not found"));
        return bagMapper.toResponse(bag);
    }
}