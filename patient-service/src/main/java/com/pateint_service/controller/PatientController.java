package com.pateint_service.controller;

import com.pateint_service.dto.PatientDto;
import com.pateint_service.entity.Patient;
import com.pateint_service.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/patient")
public class PatientController {
    private PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/getPatientById")
    public Patient getPatientById(@RequestParam long id){
        return patientService.getPatientById(id);
    }


    @PostMapping("/registerPatient")
    public ResponseEntity<?> registerPatient(@RequestBody PatientDto patientDto){
        return patientService.registerPatient(patientDto);
    }

    @PutMapping("/updatePatient")
    public ResponseEntity<?> updatePatient(@RequestBody Patient patient){
        return patientService.updatePatient(patient);
    }

    @DeleteMapping("/deletePatient")
    public ResponseEntity<?> deletePatientById(@RequestParam("patient_id") Long patientId){
        return patientService.deletePatientById(patientId);
    }


}
