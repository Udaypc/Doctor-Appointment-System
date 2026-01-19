package com.payment_service.service;

import com.payment_service.client.BookingClient;
import com.payment_service.dto.BookingConfirmation;
import com.stripe.exception.StripeException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.stripe.model.checkout.Session;

import java.util.logging.Logger;

@Service
public class PaymentService{
    private final BookingClient bookingClient;

    public PaymentService(BookingClient bookingClient) {
        this.bookingClient = bookingClient;
    }

    public ResponseEntity<?> handleSuccess(String sessionId, Long bookingId) {

        try {
            Session session = Session.retrieve(sessionId);
            String paymentStatus = session.getPaymentStatus();

            if(paymentStatus.equals("paid")){
                BookingConfirmation bookingById = bookingClient.getBookingById(bookingId);
                bookingById.setStatus(true);
                bookingClient.updateBooking(bookingById);
                return ResponseEntity.ok().body("Payment is successfully done");
            }else{
                return ResponseEntity.status(400).body("Payment not completed");
            }

        } catch (StripeException e) {

            return ResponseEntity.status(500).body("Stripe error occurred");
        }
    }
}

