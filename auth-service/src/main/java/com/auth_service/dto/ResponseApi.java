package com.auth_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseApi {
    private String message;
    private String status;
    private String role;
    private Long entityId;
}
