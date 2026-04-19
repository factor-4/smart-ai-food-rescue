package com.smartfood.restaurant_service.domain.model;

/*
 * Why an enum for status?
 * Instead of storing "ACTIVE"/"INACTIVE" as raw strings in the DB
 * (which can have typos, inconsistencies), we use an enum.
 * Java enforces only valid values exist.
 * PostgreSQL stores it as a VARCHAR, but Java only allows these two values.
 */
public enum RestaurantStatus {
    ACTIVE,
    INACTIVE
}