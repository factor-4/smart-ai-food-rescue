package com.smartfood.restaurant_service.exception;

/*
 * Thrown when a user tries to modify something they don't own.
 * Maps to HTTP 403 Forbidden.
 *
 * 401 Unauthorized = not authenticated (no token)
 * 403 Forbidden    = authenticated but not allowed (wrong owner)
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}