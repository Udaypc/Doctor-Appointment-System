package com.doctor_service.controller;

import com.doctor_service.entity.Doctor;
import com.doctor_service.service.SearchDoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {
    private final SearchDoctorService searchDoctorService;

    public SearchController(SearchDoctorService searchDoctorService) {
        this.searchDoctorService = searchDoctorService;
    }

    @GetMapping("/getDoctorsBySpecializationAndArea")
    public ResponseEntity<?> search(@RequestParam String specialization, @RequestParam String area){
        return searchDoctorService.searchDoctor(specialization,area);
    }

    @GetMapping("/getDoctorById")
    public Doctor getDoctorById(@RequestParam long id){
        return  searchDoctorService.getById(id);

    }

    @GetMapping("/getAllDoctors")
    public ResponseEntity<?> getAllDoctor(){
        return searchDoctorService.getAllDoctor();
    }
}
