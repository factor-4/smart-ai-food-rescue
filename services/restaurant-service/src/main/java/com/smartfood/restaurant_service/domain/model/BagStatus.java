package com.smartfood.restaurant_service.domain.model;



/*
 * AVAILABLE  — bag is listed and can be ordered
 * SOLD_OUT   — all quantities taken
 * CANCELLED  — restaurant cancelled this bag listing
 */
public enum BagStatus {
    AVAILABLE,
    SOLD_OUT,
    CANCELLED
}