package com.booking_service.controller;

import com.booking_service.Service.BookingService;
import com.booking_service.entity.BookingConfirmation;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.http.HttpStatus;
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

//    @CircuitBreaker(name = "booking-service", fallbackMethod="fallBack")
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateBooking( @RequestParam Long doctorId,
                                   @RequestParam Long patientId,
                                   @RequestParam LocalDate date,
                                   @RequestParam LocalTime time){
       return bookingService.initiateBooking(doctorId, patientId, date, time);


    }
    public ResponseEntity<?> fallBack(Long doctorId,
                                      Long patientId,
                                      LocalDate date,
                                      LocalTime time,
                                      Throwable throwable){
        return ResponseEntity.internalServerError().body("Server is down");
    }

    @GetMapping("/getBookingById")
    public BookingConfirmation getBookingById(@RequestParam long id){
        return bookingService.getBookingById(id);
    }


    @PutMapping("/updateBooking")
    public void updateBooking(@RequestBody BookingConfirmation bookingConfirmation){
        bookingService.updateBooking(bookingConfirmation);
    }


}
