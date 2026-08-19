package com.auth_service.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JWTService {
    private static final String SECRET_KEY = "my_secret_key";
    private static final Long EXPIRES_TIME = 865400000L;

    public String generateJwtToken(String emailId, String role, Long entityId) {
        var builder = JWT.create()
                .withSubject(emailId)
                .withClaim("role", role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRES_TIME));
        if (entityId != null) {
            builder.withClaim("entityId", entityId);
        }
        return builder.sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public DecodedJWT verifyJwtToken(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                .build()
                .verify(token);
    }

    public String varifyJwtToken(String token) {
        return verifyJwtToken(token).getSubject();
    }
}
