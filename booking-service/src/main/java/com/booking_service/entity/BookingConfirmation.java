package com.booking_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "doctor_id")
    private long doctorId;

    @Column(name="patient_id")
    private long patientId;

    private String address;
    private LocalDate date;
    private LocalTime time;
    private Boolean status;

}
