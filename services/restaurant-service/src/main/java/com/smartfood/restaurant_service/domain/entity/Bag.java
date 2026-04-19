package com.smartfood.restaurant_service.domain.entity;



import com.smartfood.restaurant_service.domain.model.BagStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;


    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountedPrice;


    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;


    @Column(nullable = false)
    private LocalDateTime pickupTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BagStatus status = BagStatus.AVAILABLE;

    /*
     * @ManyToOne — many bags belong to one restaurant.
     * fetch = FetchType.LAZY — don't load the full Restaurant object
     * every time you load a Bag. Load it only when accessed.
     *
     * @JoinColumn(name = "restaurant_id") — the foreign key column
     * in the "bags" table that references "restaurants.id".
     * nullable = false — a bag must always belong to a restaurant.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}