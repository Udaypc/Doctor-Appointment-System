package com.booking_service.repository;

import com.booking_service.entity.BookingConfirmation;
import com.booking_service.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;

public interface BookingConfirmationRepository extends JpaRepository<BookingConfirmation, Long> {

    List<BookingConfirmation> findByPatientId(long patientId);

    List<BookingConfirmation> findByDoctorId(long doctorId);

    boolean existsByDoctorIdAndDateAndTimeAndStatusIn(
            Long doctorId,
            LocalDate date,
            LocalTime time,
            Collection<BookingStatus> statuses);
}
