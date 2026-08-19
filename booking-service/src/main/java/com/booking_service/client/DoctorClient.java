package com.booking_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.booking_service.dto.Doctor;

import java.time.LocalDate;
import java.time.LocalTime;

@FeignClient(name = "DOCTOR-SERVICE")
public interface DoctorClient {

    @GetMapping("/api/v1/search/getDoctorById")
    Doctor getDoctorById(@RequestParam long id);

    @DeleteMapping("/api/v1/doctor/slots/by-datetime")
    void removeSlotByDateTime(
            @RequestParam long doctorId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime time);

    @PostMapping("/api/v1/doctor/slots/by-datetime")
    void restoreSlotByDateTime(
            @RequestParam long doctorId,
            @RequestParam LocalDate date,
            @RequestParam LocalTime time);
}
