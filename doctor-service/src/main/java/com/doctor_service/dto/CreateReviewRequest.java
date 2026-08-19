package com.doctor_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequest {
    private Long doctorId;
    private Long patientId;
    private Long bookingId;
    private Integer rating;
    private String comment;
}
