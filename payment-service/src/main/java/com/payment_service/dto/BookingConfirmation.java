package com.payment_service.dto;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class BookingConfirmation {
    private long id;
    private String doctorId;
    private String patientId;
    private String address;
    private LocalDate date;
    private LocalTime time;
    private Boolean status;
}
