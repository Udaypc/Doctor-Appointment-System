package com.booking_service.client;

import com.booking_service.dto.Patient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "PATIENT-SERVICE")
public interface PatientClient {
    @GetMapping("api/v1/patient/getPatientById")
    Patient getPatientById(@RequestParam long id);
}
