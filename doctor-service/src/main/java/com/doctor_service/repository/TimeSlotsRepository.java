package com.doctor_service.repository;

import com.doctor_service.entity.Time_Slots;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotsRepository extends JpaRepository<Time_Slots, Long> {
}
