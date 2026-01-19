package com.pateint_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class PatientDto {
    @NotNull
    private String name;
    @NotNull
    @Email(message = "Invalid Format")
    private String email;

    @NotNull
    @Size(min = 10,max = 10)
    private long contact;
    private String password;
}
