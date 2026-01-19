package com.auth_service.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JWTService {
    private static final String SECRET_KEY="my_secret_key";
    private static final Long EXPIRES_TIME=865400000L;

    public String generateJwtToken(String emailId,String role){
        return JWT.create()
                .withSubject(emailId)
                .withClaim("role",role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis()+EXPIRES_TIME))
                .sign(Algorithm.HMAC256(SECRET_KEY));
    }

    public String varifyJwtToken(String token){
        return JWT.require(Algorithm.HMAC256(SECRET_KEY))
                .build()
                .verify(token)
                .getSubject();
    }
}
