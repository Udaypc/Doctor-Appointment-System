package com.doctor_service.repository;

import com.doctor_service.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByContact(String contact);
    boolean existsByEmail(String email);
    Optional<Doctor> findByEmail(String email);

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialization) = LOWER(:specialization) AND LOWER(d.area.name) = LOWER(:area)")
    List<Doctor> searchBySpecializationAndArea(@Param("specialization") String specialization, @Param("area") String area);

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialization) = LOWER(:specialization)")
    List<Doctor> searchBySpecialization(@Param("specialization") String specialization);

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.city.name) = LOWER(:city)")
    List<Doctor> searchByCity(@Param("city") String city);

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialization) = LOWER(:specialization) AND LOWER(d.city.name) = LOWER(:city)")
    List<Doctor> searchBySpecializationAndCity(@Param("specialization") String specialization, @Param("city") String city);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d ORDER BY d.specialization")
    List<String> findAllSpecializations();

    @Query("SELECT DISTINCT d.city.name FROM Doctor d ORDER BY d.city.name")
    List<String> findAllCities();

    @Query("SELECT DISTINCT d.area.name FROM Doctor d WHERE LOWER(d.city.name) = LOWER(:city) ORDER BY d.area.name")
    List<String> findAreasByCity(@Param("city") String city);
}
