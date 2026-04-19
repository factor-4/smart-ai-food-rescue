package com.smartfood.restaurant_service.exception;

/*
 * Thrown when something is not found in the database.
 * Maps to HTTP 404.
 *
 * extends RuntimeException — unchecked exception.
 * Why unchecked? Because "not found" is not something
 * every method in the call stack needs to declare or catch.
 * It bubbles up to a global exception handler (Step 6).
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}