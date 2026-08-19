package com.doctor_service.repository;

import com.doctor_service.entity.DoctorAppointmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DoctorAppointmentScheduleRepository extends JpaRepository<DoctorAppointmentSchedule, Long> {

    Optional<DoctorAppointmentSchedule> findByDoctorIdAndDate(Long doctorId, LocalDate date);
}
