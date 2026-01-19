package com.pateint_service.dto;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class PatientDto {
    private String name;
    private String email;
    private long contact;
    private String password;
}
