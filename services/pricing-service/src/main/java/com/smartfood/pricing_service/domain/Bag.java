package com.smartfood.pricing_service.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "bags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Bag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String status;

    // This column stores the discount percentage (e.g. 0.20 = 20% off)
    @Column(name = "current_discount", precision = 5, scale = 4)
    private BigDecimal currentDiscount;
}