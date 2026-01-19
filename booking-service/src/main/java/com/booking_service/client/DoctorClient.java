package com.booking_service.client;

import com.booking_service.dto.Doctor;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "DOCTOR-SERVICE")
public interface DoctorClient{

    @GetMapping("/api/v1/search/getDoctorById")
    Doctor getDoctorById(@RequestParam long id);
}
