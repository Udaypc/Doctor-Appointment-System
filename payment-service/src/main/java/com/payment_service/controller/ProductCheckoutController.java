package com.payment_service.controller;

import com.payment_service.dto.ProductRequest;
import com.payment_service.dto.StripeResponse;
import com.payment_service.service.PaymentService;
import com.payment_service.service.StripeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/product/v1")
public class ProductCheckoutController {

    private StripeService stripeService;
    private PaymentService paymentService;


    public ProductCheckoutController(StripeService stripeService, PaymentService paymentService) {
        this.stripeService = stripeService;
        this.paymentService = paymentService;
    }

    @PostMapping("/checkout")
    public StripeResponse checkProduct(@RequestBody ProductRequest productRequest){
        return stripeService.checkoutProducts(productRequest);
    }

    @GetMapping("/success")
    public ResponseEntity<?> handleSuccess(@RequestParam("session_id") String sessionId, @RequestParam("booking_id") Long bookingId){
        return paymentService.handleSuccess(sessionId, bookingId);
    }

    @GetMapping("/cancel")
    public ResponseEntity<?> handleCancel(){
        return ResponseEntity.ok("Payment canceled");
    }

}
