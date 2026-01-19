package com.booking_service.repository;

import com.booking_service.entity.BookingConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingConfirmationRepository extends JpaRepository<BookingConfirmation,Long> {
}
