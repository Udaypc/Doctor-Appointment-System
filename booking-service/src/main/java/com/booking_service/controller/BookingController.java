package com.booking_service.controller;

import com.booking_service.Service.BookingService;
import com.booking_service.entity.BookingConfirmation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiateBooking(@RequestParam Long doctorId,
                                             @RequestParam Long patientId,
                                             @RequestParam LocalDate date,
                                             @RequestParam LocalTime time) {
        return bookingService.initiateBooking(doctorId, patientId, date, time);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable long id) {
        return bookingService.getBookingById(id);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getBookingsByPatient(@PathVariable long patientId) {
        return bookingService.getBookingsByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getBookingsByDoctor(@PathVariable long doctorId) {
        return bookingService.getBookingsByDoctorId(doctorId);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable long id) {
        return bookingService.cancelBooking(id);
    }

    @PutMapping("/updateBooking")
    public void updateBooking(@RequestBody BookingConfirmation bookingConfirmation) {
        bookingService.updateBooking(bookingConfirmation);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings() {
        return bookingService.getAllBookings();
    }
}
