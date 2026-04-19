package com.smartfood.restaurant_service.exception;

/*
 * Thrown when trying to create something that already exists.
 * Maps to HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}