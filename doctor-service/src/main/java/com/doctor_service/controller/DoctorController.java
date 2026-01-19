package com.doctor_service.controller;

import com.doctor_service.dto.DoctorDto;
import com.doctor_service.entity.Doctor;
import com.doctor_service.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/doctor")
public class DoctorController {

    private final DoctorService DoctorService;

    public DoctorController(DoctorService DoctorService) {
        this.DoctorService = DoctorService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorDto doctorDto){
        return DoctorService.registerDoctor(doctorDto);
    }

    @PutMapping("/updateDoctor")
    public ResponseEntity<?> updateDoctor(@RequestBody Doctor doctor){
        return DoctorService.updateDoctor(doctor);
    }


    @DeleteMapping("/deleteDoctor")
    public ResponseEntity<?> deleteDoctorById(@RequestParam long id){
        return DoctorService.deleteDoctorById(id);
    }

}
