package com.payment_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalException {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handelException(Exception e){
        return new ResponseEntity<>("Something went wrong "+e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
