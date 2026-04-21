package com.smartfood.restaurant_service.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

/*

 * We use this in JwtAuthenticationFilter to build
 * Spring Security's Authentication object.
 */
@Getter
@AllArgsConstructor
public class JwtClaims {
    private String username;
    private List<String> roles;
    private Long userId;
}