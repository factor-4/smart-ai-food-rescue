package com.smartfood.restaurant_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/*
 * Runs on EVERY incoming HTTP request, exactly once.
 *
 * Job: read the JWT from the Authorization header,
 * validate it, and tell Spring Security who this user is.
 *
 * After this filter runs, Spring Security knows:
 * - the username (principal)
 * - the userId (stored in details)
 * - the roles (authorities)
 *
 * Protected endpoints then check these automatically.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenValidator jwtTokenValidator;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // No token — continue as anonymous, Spring Security
        // will block protected endpoints automatically
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Remove "Bearer " prefix (7 characters)
        String token = authHeader.substring(7);

        try {
            JwtClaims claims = jwtTokenValidator.validate(token);

            List<SimpleGrantedAuthority> authorities = claims.getRoles()
                    .stream()
                    .map(SimpleGrantedAuthority::new)
                    .toList();


            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            claims.getUserId(),   // principal = userId (Long)
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            // Invalid token — clear and continue as anonymous
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}