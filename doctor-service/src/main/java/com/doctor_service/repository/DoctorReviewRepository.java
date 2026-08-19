package com.doctor_service.repository;

import com.doctor_service.entity.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DoctorReviewRepository extends JpaRepository<DoctorReview, Long> {

    List<DoctorReview> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    Optional<DoctorReview> findByDoctorIdAndPatientId(Long doctorId, Long patientId);

    boolean existsByDoctorIdAndPatientId(Long doctorId, Long patientId);

    @Query("SELECT AVG(r.rating) FROM DoctorReview r WHERE r.doctorId = :doctorId")
    Double findAverageRatingByDoctorId(@Param("doctorId") Long doctorId);

    long countByDoctorId(Long doctorId);
}
