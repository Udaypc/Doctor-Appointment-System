package com.auth_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinkEntityRequest {
    private String email;
    private Long entityId;
}
