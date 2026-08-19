package com.doctor_service.controller;

import com.doctor_service.dto.DoctorAppointmentScheduleDto;
import com.doctor_service.dto.DoctorDto;
import com.doctor_service.dto.Time_Slots_Dto;
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
    public ResponseEntity<?> updateDoctor(@RequestBody DoctorDto doctorDto){
        return DoctorService.updateDoctor(doctorDto);
    }

    @DeleteMapping("/deleteDoctor")
    public ResponseEntity<?> deleteDoctorById(@RequestParam long id){
        return DoctorService.deleteDoctorById(id);
    }

    @PostMapping("/schedules")
    public ResponseEntity<?> addSchedule(
            @RequestParam long doctorId,
            @RequestBody DoctorAppointmentScheduleDto scheduleDto) {
        return DoctorService.addSchedule(doctorId, scheduleDto);
    }

    @DeleteMapping("/schedules/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(@PathVariable long scheduleId) {
        return DoctorService.deleteSchedule(scheduleId);
    }

    @PostMapping("/schedules/{scheduleId}/slots")
    public ResponseEntity<?> addSlot(
            @PathVariable long scheduleId,
            @RequestBody Time_Slots_Dto slotDto) {
        return DoctorService.addSlot(scheduleId, slotDto);
    }

    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteSlot(@PathVariable long slotId) {
        return DoctorService.deleteSlot(slotId);
    }

    @DeleteMapping("/slots/by-datetime")
    public ResponseEntity<?> removeSlotByDateTime(
            @RequestParam long doctorId,
            @RequestParam java.time.LocalDate date,
            @RequestParam java.time.LocalTime time) {
        return DoctorService.removeSlotByDateTime(doctorId, date, time);
    }

    @PostMapping("/slots/by-datetime")
    public ResponseEntity<?> restoreSlotByDateTime(
            @RequestParam long doctorId,
            @RequestParam java.time.LocalDate date,
            @RequestParam java.time.LocalTime time) {
        return DoctorService.restoreSlotByDateTime(doctorId, date, time);
    }

}
