package com.auth_service.service;

import com.auth_service.dto.LinkEntityRequest;
import com.auth_service.dto.LoginDto;
import com.auth_service.dto.ResponseApi;
import com.auth_service.entity.User;
import com.auth_service.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTService jwtService;

    public ResponseEntity<?> login(LoginDto loginDto) {
        try {
            UsernamePasswordAuthenticationToken token =
                    new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword());
            Authentication authenticate = authenticationManager.authenticate(token);
            if (!authenticate.isAuthenticated()) {
                return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
            }

            User user = authRepository.findByEmail(loginDto.getEmail());
            if (user == null) {
                return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
            }

            String dbRole = user.getRole() != null ? user.getRole() : loginDto.getRole();
            String jwtToken = jwtService.generateJwtToken(user.getEmail(), dbRole, user.getEntityId());

            ResponseApi res = new ResponseApi();
            res.setMessage(jwtToken);
            res.setRole(dbRole);
            res.setEntityId(user.getEntityId());
            res.setStatus(String.valueOf(HttpStatus.OK));
            return new ResponseEntity<>(res, HttpStatus.OK);
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        } catch (AuthenticationException e) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }

    public ResponseEntity<String> register(User user) {
        if (authRepository.findByEmail(user.getEmail()) != null) {
            return new ResponseEntity<>("Email already registered", HttpStatus.CONFLICT);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        authRepository.save(user);
        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }

    /**
     * Links patient/doctor service ID onto an existing auth user (for older accounts
     * created before entityId existed, or after email lookup on first login).
     */
    public ResponseEntity<?> linkEntityId(LinkEntityRequest request) {
        if (request.getEmail() == null || request.getEntityId() == null) {
            return new ResponseEntity<>("email and entityId are required", HttpStatus.BAD_REQUEST);
        }
        User user = authRepository.findByEmail(request.getEmail());
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        user.setEntityId(request.getEntityId());
        authRepository.save(user);

        String jwtToken = jwtService.generateJwtToken(user.getEmail(), user.getRole(), user.getEntityId());
        ResponseApi res = new ResponseApi();
        res.setMessage(jwtToken);
        res.setRole(user.getRole());
        res.setEntityId(user.getEntityId());
        res.setStatus(String.valueOf(HttpStatus.OK));
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}
