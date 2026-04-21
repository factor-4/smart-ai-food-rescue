package com.smartfood.restaurant_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

/*
 * Validates incoming JWT tokens using the RSA public key.


 */
@Component
public class JwtTokenValidator {

    @Value("${app.jwt.public-key-path}")
    private Resource publicKeyResource;

    private PublicKey publicKey;

    /*
     * @PostConstruct runs once after Spring creates this bean.
     * We load the public key from the PEM file into memory.
     * This way we read the file ONCE at startup, not on every request.
     */
    @PostConstruct
    public void init() throws Exception {
        try (InputStream in = publicKeyResource.getInputStream()) {

            /*

             * We strip the header, footer, and all whitespace
             * to get the raw Base64 encoded key data.
             */
            String pem = StreamUtils
                    .copyToString(in, StandardCharsets.UTF_8)
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            byte[] keyBytes = Base64.getDecoder().decode(pem);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            this.publicKey = keyFactory.generatePublic(keySpec);
        }
    }

    /*
     * Validates the token and extracts claims.
     *
     * parseClaimsJws() does THREE things at once:
     * 1. Verifies the RSA signature (was this signed by our private key?)
     * 2. Checks expiration (is this token still valid?)
     * 3. Parses and returns the payload (claims)

     */
    public JwtClaims validate(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // "sub" field — the username
        String username = claims.getSubject();

        // "roles" custom claim — list of role strings
        List<String> roles = claims.get("roles", List.class);
        if (roles == null) {
            roles = List.of("ROLE_USER");
        }

        /*
         * "userId" custom claim — stored as Integer in JSON.
         * JWT numbers deserialize as Integer by default in Java,
         * so we cast to Number first then convert to Long.
         * Casting directly to Long would throw ClassCastException.
         */
        Number userIdNumber = (Number) claims.get("userId");
        Long userId = userIdNumber != null ? userIdNumber.longValue() : null;

        return new JwtClaims(username, roles, userId);
    }
}