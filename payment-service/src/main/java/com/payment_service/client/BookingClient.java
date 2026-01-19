package com.payment_service.client;

import com.payment_service.dto.BookingConfirmation;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "BOOKING-SERVICE")
public interface BookingClient {
    @GetMapping("api/v1/bookings/getBookingById")
    BookingConfirmation getBookingById(@RequestParam long id);

    @PutMapping("api/v1/bookings/updateBooking")
    void updateBooking(@RequestBody BookingConfirmation bookingConfirmation);
}
