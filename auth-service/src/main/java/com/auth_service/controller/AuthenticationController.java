package com.auth_service.controller;

import com.auth_service.dto.LoginDto;
import com.auth_service.entity.User;
import com.auth_service.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> login( @RequestBody LoginDto loginDto){
        return authenticationService.login(loginDto);
    }
    @PostMapping("/register")
    public String registerUser(@RequestBody User user){
        return authenticationService.register(user);
    }
}
