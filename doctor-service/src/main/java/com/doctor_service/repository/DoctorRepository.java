package com.doctor_service.repository;


import com.doctor_service.entity.Area;
import com.doctor_service.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor,Long> {

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialization) = LOWER(:specialization) AND LOWER(d.area.name)=LOWER(:area)")
    List<Doctor> searchBySpecializationAndArea(@Param("specialization") String specialization,@Param("area") String area);
}
