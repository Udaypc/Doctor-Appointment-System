package com.doctor_service.client;

import com.doctor_service.dto.AuthUserRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service")
public interface AuthClient {

    @PostMapping("/api/v1/auth/register")
    String registerUser(@RequestBody AuthUserRequest request);
}
