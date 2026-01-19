package com.auth_service.service;

import com.auth_service.dto.LoginDto;
import com.auth_service.dto.ResponseApi;
import com.auth_service.entity.User;
import com.auth_service.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private  final AuthenticationManager authenticationManager;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public ResponseEntity<?> login(LoginDto loginDto){
        UsernamePasswordAuthenticationToken token=new UsernamePasswordAuthenticationToken(loginDto.getEmail(),loginDto.getPassword());
        Authentication authenticate = authenticationManager.authenticate(token);
        if(authenticate.isAuthenticated()){

            String jwtToken = jwtService.generateJwtToken(loginDto.getEmail(), loginDto.getRole());

            ResponseApi res=new ResponseApi();
            res.setMessage(jwtToken);
            res.setRole(loginDto.getRole());
            res.setStatus(String.valueOf(HttpStatus.OK));

            return new ResponseEntity<>(res, HttpStatus.OK);
        }
        return new ResponseEntity<>("Not Authenticated",HttpStatus.BAD_REQUEST);
    }

    public String register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        authRepository.save(user);
        return "";
    }
}
