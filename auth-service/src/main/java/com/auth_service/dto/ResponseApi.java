package com.auth_service.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

@Getter
@Setter
public class ResponseApi {
    private String message;
    private String status;
    private String role;
}
