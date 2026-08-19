package com.pateint_service.service;

import com.pateint_service.client.AuthClient;
import com.pateint_service.dto.AuthUserRequest;
import com.pateint_service.dto.PatientDto;
import com.pateint_service.entity.Patient;
import com.pateint_service.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final AuthClient authClient;

    public Patient getPatientById(long id) {
        Optional<Patient> optionalPatient = patientRepository.findById(id);
        return optionalPatient.orElseGet(Patient::new);
    }

    public ResponseEntity<?> getPatientByEmail(String email) {
        Optional<Patient> optional = patientRepository.findByEmail(email);
        return optional
                .<ResponseEntity<?>>map(p -> new ResponseEntity<>(p, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Patient not found", HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<?> registerPatient(PatientDto patientDto) {
        Patient patient = new Patient();
        BeanUtils.copyProperties(patientDto, patient);

        // Save patient first so we have an ID to embed in the auth JWT
        Patient savedPatient = patientRepository.save(patient);

        AuthUserRequest authUserRequest = new AuthUserRequest();
        authUserRequest.setEmail(savedPatient.getEmail());
        authUserRequest.setPassword(patientDto.getPassword());
        authUserRequest.setUsername(savedPatient.getName());
        authUserRequest.setRole("ROLE_PATIENT");
        authUserRequest.setEntityId(savedPatient.getId());

        authClient.registerUser(authUserRequest);

        return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
    }

    public ResponseEntity<?> updatePatient(Patient incoming) {
        Optional<Patient> optional = patientRepository.findById(incoming.getId());
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Patient not found", HttpStatus.NOT_FOUND);
        }
        Patient existing = optional.get();
        if (incoming.getName() != null && !incoming.getName().isBlank()) {
            existing.setName(incoming.getName());
        }
        if (incoming.getContact() > 0) {
            existing.setContact(incoming.getContact());
        }
        // email stays unchanged (unique login key)
        Patient updatedPatient = patientRepository.save(existing);
        return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
    }

    public ResponseEntity<?> deletePatientById(Long patientId) {
        patientRepository.deleteById(patientId);
        return new ResponseEntity<>("Deleted successfully", HttpStatus.OK);
    }
}
