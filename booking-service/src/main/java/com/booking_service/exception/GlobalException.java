package com.booking_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalException{

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception e){
        return ResponseEntity.badRequest().body("Something went wrong "+e.getMessage());
    }
}
