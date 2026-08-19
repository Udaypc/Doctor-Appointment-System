package com.doctor_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DoctorRatingSummary {
    private Long doctorId;
    private Double averageRating;
    private long reviewCount;
    private List<ReviewDto> reviews = new ArrayList<>();

    @Getter
    @Setter
    public static class ReviewDto {
        private Long id;
        private Long patientId;
        private Long bookingId;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }
}
