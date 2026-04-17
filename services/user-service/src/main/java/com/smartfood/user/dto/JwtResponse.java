package com.smartfood.user.dto;

public record JwtResponse(
        String accessToken,
        Long id,
        String username,
        String role
) {}