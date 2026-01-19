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

    public ResponseEntity<?> registerPatient(PatientDto patientDto) {
        Patient patient=new Patient();
        BeanUtils.copyProperties(patientDto,patient);


        AuthUserRequest authUserRequest=new AuthUserRequest();
        authUserRequest.setEmail(patient.getEmail());
        authUserRequest.setPassword(patientDto.getPassword());
        authUserRequest.setUsername(patient.getName());
        authUserRequest.setRole("ROLE_PATIENT");

        authClient.registerUser(authUserRequest);

        Patient savePatient = patientRepository.save(patient);

        return new ResponseEntity<>(patient, HttpStatus.CREATED);
    }

    public ResponseEntity<?> updatePatient(Patient patient) {
        Patient updatedPatient = patientRepository.save(patient);
        return new ResponseEntity<>(updatedPatient,HttpStatus.ACCEPTED);
    }

    public ResponseEntity<?> deletePatientById(Long patientId) {
        patientRepository.deleteById(patientId);
        return new ResponseEntity<>("Deleted successfully",HttpStatus.OK);
    }

}
