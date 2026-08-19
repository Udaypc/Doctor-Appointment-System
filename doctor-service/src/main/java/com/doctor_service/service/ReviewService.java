package com.doctor_service.service;

import com.doctor_service.dto.CreateReviewRequest;
import com.doctor_service.dto.DoctorRatingSummary;
import com.doctor_service.entity.DoctorReview;
import com.doctor_service.repository.DoctorRepository;
import com.doctor_service.repository.DoctorReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final DoctorReviewRepository reviewRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public ResponseEntity<?> createReview(CreateReviewRequest request) {
        if (request.getDoctorId() == null || request.getPatientId() == null) {
            return new ResponseEntity<>("doctorId and patientId are required", HttpStatus.BAD_REQUEST);
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            return new ResponseEntity<>("Rating must be between 1 and 5", HttpStatus.BAD_REQUEST);
        }
        if (!doctorRepository.existsById(request.getDoctorId())) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }
        if (reviewRepository.existsByDoctorIdAndPatientId(request.getDoctorId(), request.getPatientId())) {
            return new ResponseEntity<>("You have already rated this doctor", HttpStatus.CONFLICT);
        }

        DoctorReview review = new DoctorReview();
        review.setDoctorId(request.getDoctorId());
        review.setPatientId(request.getPatientId());
        review.setBookingId(request.getBookingId());
        review.setRating(request.getRating());
        if (request.getComment() != null && !request.getComment().isBlank()) {
            String comment = request.getComment().trim();
            review.setComment(comment.length() > 500 ? comment.substring(0, 500) : comment);
        }

        DoctorReview saved = reviewRepository.save(review);
        return new ResponseEntity<>(toDto(saved), HttpStatus.CREATED);
    }

    public ResponseEntity<?> getDoctorRatings(long doctorId) {
        if (!doctorRepository.existsById(doctorId)) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }

        List<DoctorReview> reviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        Double avg = reviewRepository.findAverageRatingByDoctorId(doctorId);

        DoctorRatingSummary summary = new DoctorRatingSummary();
        summary.setDoctorId(doctorId);
        summary.setAverageRating(avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0);
        summary.setReviewCount(reviews.size());
        for (DoctorReview review : reviews) {
            summary.getReviews().add(toDto(review));
        }
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    public Double averageFor(long doctorId) {
        Double avg = reviewRepository.findAverageRatingByDoctorId(doctorId);
        return avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;
    }

    public long countFor(long doctorId) {
        return reviewRepository.countByDoctorId(doctorId);
    }

    private DoctorRatingSummary.ReviewDto toDto(DoctorReview review) {
        DoctorRatingSummary.ReviewDto dto = new DoctorRatingSummary.ReviewDto();
        dto.setId(review.getId());
        dto.setPatientId(review.getPatientId());
        dto.setBookingId(review.getBookingId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        return dto;
    }
}
