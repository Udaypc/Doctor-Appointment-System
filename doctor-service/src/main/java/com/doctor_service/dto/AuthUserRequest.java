package com.doctor_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthUserRequest {
    private String username;
    private String email;
    private String password;
    private String role;
}
