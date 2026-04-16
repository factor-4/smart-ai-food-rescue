package com.smartfood.user.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.private-key-path}")
    private Resource privateKeyResource;

    @Value("${app.jwt.public-key-path}")
    private Resource publicKeyResource;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;

    private PrivateKey privateKey;
    private PublicKey publicKey;

    @PostConstruct
    public void init() throws Exception {
        // Load private key
        try (InputStream in = privateKeyResource.getInputStream()) {
            String privateKeyPEM = StreamUtils.copyToString(in, StandardCharsets.UTF_8)
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] privateKeyBytes = Base64.getDecoder().decode(privateKeyPEM);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            this.privateKey = keyFactory.generatePrivate(keySpec);
        }

        // Load public key
        try (InputStream in = publicKeyResource.getInputStream()) {
            String publicKeyPEM = StreamUtils.copyToString(in, StandardCharsets.UTF_8)
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] publicKeyBytes = Base64.getDecoder().decode(publicKeyPEM);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            this.publicKey = keyFactory.generatePublic(keySpec);
        }

        logger.info("RSA keys loaded successfully");
    }

    /**
     * Generates a JWT token signed with RSA private key.
     */
    public String generateJwtToken(Authentication authentication) {
        // TODO: Replace with actual UserDetailsImpl once created
        // UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();
        // String username = userPrincipal.getUsername();

        // Temporary placeholder:
        String username = authentication.getName();

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    /**
     * Extracts username from token using public key verification.
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validates token using public key.
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(publicKey).build().parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Returns the public key for exposing via JWKS endpoint (to be added later).
     */
    public PublicKey getPublicKey() {
        return publicKey;
    }
}