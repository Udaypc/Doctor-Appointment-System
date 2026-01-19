package com.api_gateway.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.List;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final String SECRET_KEY="my_secret_key";

    private final List<String>  OPEN_API_END_POINTS=List.of(
            "/auth/api/v1/auth/login",
            "/doctor/api/v1/doctor/register",
            "/patient/api/v1/patient/registerPatient"
    );

    public boolean isPublicEndPoint(String path){
        return OPEN_API_END_POINTS.contains(path);
    }




    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();

        if(isPublicEndPoint(path)){
            return chain.filter(exchange);
        }
        String authToken = exchange.getRequest().getHeaders().getFirst("Authorization");
        if(authToken==null|| !authToken.startsWith("Bearer")){
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        String token=authToken.substring(7);

        try{
            DecodedJWT verify = JWT.require(Algorithm.HMAC256(SECRET_KEY))
                    .build()
                    .verify(token);

            String subject = verify.getSubject();
            String role= verify.getClaim("role").toString();
            exchange.mutate()
                    .request(r->r.header("username",subject))
                    .build();

            return chain.filter(exchange);

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
