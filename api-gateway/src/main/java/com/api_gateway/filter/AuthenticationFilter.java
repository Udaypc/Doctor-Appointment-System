package com.api_gateway.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final String SECRET_KEY="my_secret_key";

    private final List<String> OPEN_API_END_POINTS = List.of(
            "/auth/api/v1/auth/login",
            "/auth/api/v1/auth/register",
            "/auth/api/v1/auth/entity-id",
            "/doctor/api/v1/doctor/register",
            "/patient/api/v1/patient/registerPatient",
            "/doctor/api/v1/search/getAllDoctors",
            "/doctor/api/v1/search/getDoctorById",
            "/doctor/api/v1/search/getDoctorByEmail",
            "/doctor/api/v1/search/specializations",
            "/doctor/api/v1/search/cities",
            "/doctor/api/v1/search/areas",
            "/doctor/api/v1/search/search",
            "/doctor/api/v1/search/available-slots",
            "/patient/api/v1/patient/getPatientByEmail",
            "/patient/api/v1/patient/getPatientById",
            "/patient/api/v1/patient/updatePatient",
            "/doctor/api/v1/doctor/updateDoctor",
            "/doctor/api/v1/doctor/schedules",
            "/doctor/api/v1/doctor/slots",
            "/doctor/api/v1/reviews",
            "/booking/api/v1/bookings"
    );

    public boolean isPublicEndPoint(String path) {
        return OPEN_API_END_POINTS.stream().anyMatch(path::startsWith);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Let CORS preflight through without JWT
        if (exchange.getRequest().getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        String path = exchange.getRequest().getURI().getPath();

        if (isPublicEndPoint(path)) {
            return chain.filter(exchange);
        }

        String authToken = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authToken == null || !authToken.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token = authToken.substring(7);

        try {
            DecodedJWT verify = JWT.require(Algorithm.HMAC256(SECRET_KEY))
                    .build()
                    .verify(token);

            String subject = verify.getSubject();
            Long entityId = verify.getClaim("entityId").isNull()
                    ? null
                    : verify.getClaim("entityId").asLong();

            ServerWebExchange mutated = exchange.mutate()
                    .request(r -> {
                        r.header("username", subject);
                        if (entityId != null) {
                            r.header("entityId", String.valueOf(entityId));
                        }
                    })
                    .build();

            return chain.filter(mutated);
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
