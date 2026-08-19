package com.doctor_service.controller;

import com.doctor_service.dto.CreateReviewRequest;
import com.doctor_service.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody CreateReviewRequest request) {
        return reviewService.createReview(request);
    }

    @PostMapping("/addRating")
    public ResponseEntity<?> addRating(@RequestBody CreateReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorRatings(@PathVariable long doctorId) {
        return reviewService.getDoctorRatings(doctorId);
    }
}
