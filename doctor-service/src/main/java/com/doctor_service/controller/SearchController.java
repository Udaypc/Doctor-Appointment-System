package com.doctor_service.controller;

import com.doctor_service.dto.DoctorDto;
import com.doctor_service.service.SearchDoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {
    private final SearchDoctorService searchDoctorService;

    public SearchController(SearchDoctorService searchDoctorService) {
        this.searchDoctorService = searchDoctorService;
    }

    @GetMapping("/getDoctorsBySpecializationAndArea")
    public ResponseEntity<?> searchBySpecializationAndArea(@RequestParam String specialization,
                                                           @RequestParam String area) {
        return searchDoctorService.searchDoctor(specialization, area);
    }

    @GetMapping("/getDoctorsBySpecialization")
    public ResponseEntity<?> searchBySpecialization(@RequestParam String specialization) {
        return searchDoctorService.searchBySpecialization(specialization);
    }

    @GetMapping("/getDoctorsByCity")
    public ResponseEntity<?> searchByCity(@RequestParam String city) {
        return searchDoctorService.searchByCity(city);
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam(required = false) String specialization,
                                    @RequestParam(required = false) String city,
                                    @RequestParam(required = false) String area) {
        if (specialization != null && city != null && area != null) {
            return searchDoctorService.searchDoctor(specialization, area);
        }
        if (specialization != null && city != null) {
            return searchDoctorService.searchBySpecializationAndCity(specialization, city);
        }
        if (specialization != null) {
            return searchDoctorService.searchBySpecialization(specialization);
        }
        if (city != null) {
            return searchDoctorService.searchByCity(city);
        }
        return searchDoctorService.getAllDoctor();
    }

    @GetMapping("/getDoctorById/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable long id) {
        DoctorDto doctor = searchDoctorService.getById(id);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/getDoctorByEmail")
    public ResponseEntity<?> getDoctorByEmail(@RequestParam String email) {
        return searchDoctorService.getByEmail(email);
    }

    @GetMapping("/getDoctorById")
    public DoctorDto getDoctorByIdParam(@RequestParam long id) {
        return searchDoctorService.getById(id);
    }

    @GetMapping("/getAllDoctors")
    public ResponseEntity<?> getAllDoctor() {
        return searchDoctorService.getAllDoctor();
    }

    @GetMapping("/specializations")
    public ResponseEntity<?> getAllSpecializations() {
        return searchDoctorService.getAllSpecializations();
    }

    @GetMapping("/cities")
    public ResponseEntity<?> getAllCities() {
        return searchDoctorService.getAllCities();
    }

    @GetMapping("/areas")
    public ResponseEntity<?> getAreasByCity(@RequestParam String city) {
        return searchDoctorService.getAreasByCity(city);
    }

    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam long doctorId,
                                               @RequestParam LocalDate date) {
        return searchDoctorService.getAvailableSlots(doctorId, date);
    }
}
