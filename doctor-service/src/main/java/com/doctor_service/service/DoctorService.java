package com.doctor_service.service;

import com.doctor_service.client.AuthClient;
import com.doctor_service.dto.AuthUserRequest;
import com.doctor_service.dto.DoctorAppointmentScheduleDto;
import com.doctor_service.dto.DoctorDto;
import com.doctor_service.dto.Time_Slots_Dto;
import com.doctor_service.entity.*;
import com.doctor_service.repository.AreaRepository;
import com.doctor_service.repository.CityRepository;
import com.doctor_service.repository.DoctorAppointmentScheduleRepository;
import com.doctor_service.repository.DoctorRepository;
import com.doctor_service.repository.StateRepository;
import com.doctor_service.repository.TimeSlotsRepository;

import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DoctorService{

    private final DoctorRepository doctorRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final AreaRepository areaRepository;
    private final DoctorAppointmentScheduleRepository scheduleRepository;
    private final TimeSlotsRepository timeSlotsRepository;
    private final AuthClient authClient;

    @Transactional
    public ResponseEntity<?> registerDoctor(DoctorDto doctorDto){
        // Upfront duplicate checks
        if (doctorDto.getContact() != null && doctorRepository.existsByContact(doctorDto.getContact())) {
            return new ResponseEntity<>("A doctor with this contact number already exists", HttpStatus.CONFLICT);
        }
        if (doctorDto.getEmail() != null && doctorRepository.existsByEmail(doctorDto.getEmail())) {
            return new ResponseEntity<>("A doctor with this email already exists", HttpStatus.CONFLICT);
        }

        State state;
        String stateName = doctorDto.getState();
        if (stateName != null) {
            state = stateRepository.findByName(stateName);
            if (state == null) {
                state = new State();
                state.setName(stateName);
                stateRepository.save(state);
            }
        } else {
            return new ResponseEntity<>("State is required", HttpStatus.BAD_REQUEST);
        }

        City city;
        String cityName = doctorDto.getCity();
        if (cityName != null) {
            city = cityRepository.findByName(cityName);
            if (city == null) {
                city = new City();
                city.setName(cityName);
                cityRepository.save(city);
            }
        } else {
            return new ResponseEntity<>("City is required", HttpStatus.BAD_REQUEST);
        }

        Area area;
        String areaName = doctorDto.getArea();
        if (areaName != null) {
            area = areaRepository.findByName(areaName);
            if (area == null) {
                area = new Area();
                area.setName(areaName);
                areaRepository.save(area);
            }
        } else {
            return new ResponseEntity<>("Area is required", HttpStatus.BAD_REQUEST);
        }

        Doctor doctor = new Doctor();
        doctor.setName(doctorDto.getName());
        doctor.setSpecialization(doctorDto.getSpecialization());
        doctor.setQualification(doctorDto.getQualification());
        doctor.setContact(doctorDto.getContact());
        doctor.setExperience(doctorDto.getExperience());
        doctor.setUrl(doctorDto.getUrl());
        doctor.setAddress(doctorDto.getAddress());
        doctor.setState(state);
        doctor.setCity(city);
        doctor.setArea(area);
        doctor.setEmail(doctorDto.getEmail());

        List<DoctorAppointmentScheduleDto> doctorAppointmentSchedules = doctorDto.getDoctorAppointmentSchedules();
        for (DoctorAppointmentScheduleDto scheduleDto : doctorAppointmentSchedules) {
            DoctorAppointmentSchedule schedule = new DoctorAppointmentSchedule();
            schedule.setDate(scheduleDto.getDate());
            List<Time_Slots_Dto> timeSlots = scheduleDto.getTime_Slots();
            for (Time_Slots_Dto slotDto : timeSlots) {
                Time_Slots slot = new Time_Slots();
                slot.setTime(slotDto.getTime());
                slot.setDoctorAppointmentSchedule(schedule);
                schedule.getTime_Slots().add(slot);
            }
            doctor.getDoctorAppointmentSchedules().add(schedule);
            schedule.setDoctor(doctor);
        }

        // Save doctor first, then register in auth-service (avoids orphaned auth users)
        try {
            Doctor savedDoctor = doctorRepository.save(doctor);

            AuthUserRequest authUserRequest = new AuthUserRequest();
            authUserRequest.setEmail(savedDoctor.getEmail());
            authUserRequest.setPassword(doctorDto.getPassword());
            authUserRequest.setRole("Doctor");
            authUserRequest.setUsername(savedDoctor.getName());
            authUserRequest.setEntityId(savedDoctor.getId());
            try {
                authClient.registerUser(authUserRequest);
            } catch (FeignException e) {
                // Auth registration failed — doctor is saved but login may fail until auth is fixed
            }

            return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMostSpecificCause().getMessage();
            if (msg != null && msg.contains("contact")) {
                return new ResponseEntity<>("Contact number already registered", HttpStatus.CONFLICT);
            } else if (msg != null && msg.contains("email")) {
                return new ResponseEntity<>("Email already registered", HttpStatus.CONFLICT);
            }
            return new ResponseEntity<>("Registration failed: duplicate entry", HttpStatus.CONFLICT);
        }
    }

    public ResponseEntity<?> updateDoctor(DoctorDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>("Doctor id is required", HttpStatus.BAD_REQUEST);
        }
        Optional<Doctor> optional = doctorRepository.findById(dto.getId());
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }
        Doctor existing = optional.get();

        if (dto.getName() != null && !dto.getName().isBlank()) {
            existing.setName(dto.getName());
        }
        if (dto.getContact() != null && !dto.getContact().isBlank()) {
            existing.setContact(dto.getContact());
        }
        if (dto.getSpecialization() != null && !dto.getSpecialization().isBlank()) {
            existing.setSpecialization(dto.getSpecialization());
        }
        if (dto.getQualification() != null && !dto.getQualification().isBlank()) {
            existing.setQualification(dto.getQualification());
        }
        if (dto.getExperience() != null) {
            existing.setExperience(dto.getExperience());
        }
        if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
            existing.setAddress(dto.getAddress());
        }
        if (dto.getUrl() != null) {
            existing.setUrl(dto.getUrl());
        }

        if (dto.getState() != null && !dto.getState().isBlank()) {
            State state = stateRepository.findByName(dto.getState());
            if (state == null) {
                state = new State();
                state.setName(dto.getState());
                stateRepository.save(state);
            }
            existing.setState(state);
        }
        if (dto.getCity() != null && !dto.getCity().isBlank()) {
            City city = cityRepository.findByName(dto.getCity());
            if (city == null) {
                city = new City();
                city.setName(dto.getCity());
                cityRepository.save(city);
            }
            existing.setCity(city);
        }
        if (dto.getArea() != null && !dto.getArea().isBlank()) {
            Area area = areaRepository.findByName(dto.getArea());
            if (area == null) {
                area = new Area();
                area.setName(dto.getArea());
                areaRepository.save(area);
            }
            existing.setArea(area);
        }

        Doctor saved = doctorRepository.save(existing);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    public ResponseEntity<?> deleteDoctorById(long id) {
        doctorRepository.deleteById(id);
        return new ResponseEntity<>("Deleted",HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> addSchedule(long doctorId, DoctorAppointmentScheduleDto scheduleDto) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        if (optionalDoctor.isEmpty()) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }
        if (scheduleDto.getDate() == null) {
            return new ResponseEntity<>("Date is required", HttpStatus.BAD_REQUEST);
        }
        if (scheduleDto.getDate().isBefore(LocalDate.now())) {
            return new ResponseEntity<>("Cannot add a schedule in the past", HttpStatus.BAD_REQUEST);
        }
        if (scheduleDto.getTime_Slots() == null || scheduleDto.getTime_Slots().isEmpty()) {
            return new ResponseEntity<>("At least one time slot is required", HttpStatus.BAD_REQUEST);
        }

        Doctor doctor = optionalDoctor.get();
        Optional<DoctorAppointmentSchedule> existing =
                scheduleRepository.findByDoctorIdAndDate(doctorId, scheduleDto.getDate());
        if (existing.isPresent()) {
            return new ResponseEntity<>("A schedule for this date already exists. Add slots to it instead.", HttpStatus.CONFLICT);
        }

        DoctorAppointmentSchedule schedule = new DoctorAppointmentSchedule();
        schedule.setDate(scheduleDto.getDate());
        schedule.setDoctor(doctor);

        for (Time_Slots_Dto slotDto : scheduleDto.getTime_Slots()) {
            if (slotDto.getTime() == null) {
                continue;
            }
            Time_Slots slot = new Time_Slots();
            slot.setTime(slotDto.getTime());
            slot.setDoctorAppointmentSchedule(schedule);
            schedule.getTime_Slots().add(slot);
        }
        if (schedule.getTime_Slots().isEmpty()) {
            return new ResponseEntity<>("At least one valid time slot is required", HttpStatus.BAD_REQUEST);
        }

        DoctorAppointmentSchedule saved = scheduleRepository.save(schedule);
        return new ResponseEntity<>(toScheduleDto(saved), HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<?> deleteSchedule(long scheduleId) {
        Optional<DoctorAppointmentSchedule> optional = scheduleRepository.findById(scheduleId);
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Schedule not found", HttpStatus.NOT_FOUND);
        }
        scheduleRepository.delete(optional.get());
        return new ResponseEntity<>("Schedule deleted", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> addSlot(long scheduleId, Time_Slots_Dto slotDto) {
        Optional<DoctorAppointmentSchedule> optional = scheduleRepository.findById(scheduleId);
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Schedule not found", HttpStatus.NOT_FOUND);
        }
        if (slotDto.getTime() == null) {
            return new ResponseEntity<>("Time is required", HttpStatus.BAD_REQUEST);
        }

        DoctorAppointmentSchedule schedule = optional.get();
        LocalTime time = slotDto.getTime();
        boolean duplicate = schedule.getTime_Slots().stream()
                .anyMatch(s -> s.getTime().equals(time));
        if (duplicate) {
            return new ResponseEntity<>("This time slot already exists", HttpStatus.CONFLICT);
        }

        Time_Slots slot = new Time_Slots();
        slot.setTime(time);
        slot.setDoctorAppointmentSchedule(schedule);
        schedule.getTime_Slots().add(slot);
        scheduleRepository.save(schedule);

        Time_Slots_Dto response = new Time_Slots_Dto();
        response.setId(slot.getId());
        response.setTime(slot.getTime());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Transactional
    public ResponseEntity<?> deleteSlot(long slotId) {
        Optional<Time_Slots> optional = timeSlotsRepository.findById(slotId);
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Slot not found", HttpStatus.NOT_FOUND);
        }
        Time_Slots slot = optional.get();
        DoctorAppointmentSchedule schedule = slot.getDoctorAppointmentSchedule();
        schedule.getTime_Slots().remove(slot);
        if (schedule.getTime_Slots().isEmpty()) {
            scheduleRepository.delete(schedule);
            return new ResponseEntity<>("Slot deleted (empty schedule removed)", HttpStatus.OK);
        }
        scheduleRepository.save(schedule);
        return new ResponseEntity<>("Slot deleted", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> removeSlotByDateTime(long doctorId, LocalDate date, LocalTime time) {
        Optional<DoctorAppointmentSchedule> optional =
                scheduleRepository.findByDoctorIdAndDate(doctorId, date);
        if (optional.isEmpty()) {
            return new ResponseEntity<>("Schedule not found", HttpStatus.NOT_FOUND);
        }
        DoctorAppointmentSchedule schedule = optional.get();
        Optional<Time_Slots> slotOpt = schedule.getTime_Slots().stream()
                .filter(s -> s.getTime().equals(time))
                .findFirst();
        if (slotOpt.isEmpty()) {
            return new ResponseEntity<>("Slot not found", HttpStatus.NOT_FOUND);
        }
        schedule.getTime_Slots().remove(slotOpt.get());
        if (schedule.getTime_Slots().isEmpty()) {
            scheduleRepository.delete(schedule);
        } else {
            scheduleRepository.save(schedule);
        }
        return new ResponseEntity<>("Slot removed", HttpStatus.OK);
    }

    @Transactional
    public ResponseEntity<?> restoreSlotByDateTime(long doctorId, LocalDate date, LocalTime time) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        if (optionalDoctor.isEmpty()) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }
        Doctor doctor = optionalDoctor.get();
        DoctorAppointmentSchedule schedule = scheduleRepository
                .findByDoctorIdAndDate(doctorId, date)
                .orElseGet(() -> {
                    DoctorAppointmentSchedule created = new DoctorAppointmentSchedule();
                    created.setDate(date);
                    created.setDoctor(doctor);
                    return created;
                });

        boolean exists = schedule.getTime_Slots().stream()
                .anyMatch(s -> s.getTime().equals(time));
        if (!exists) {
            Time_Slots slot = new Time_Slots();
            slot.setTime(time);
            slot.setDoctorAppointmentSchedule(schedule);
            schedule.getTime_Slots().add(slot);
            scheduleRepository.save(schedule);
        }
        return new ResponseEntity<>("Slot restored", HttpStatus.OK);
    }

    private DoctorAppointmentScheduleDto toScheduleDto(DoctorAppointmentSchedule schedule) {
        DoctorAppointmentScheduleDto dto = new DoctorAppointmentScheduleDto();
        dto.setId(schedule.getId());
        dto.setDate(schedule.getDate());
        for (Time_Slots slot : schedule.getTime_Slots()) {
            Time_Slots_Dto slotDto = new Time_Slots_Dto();
            slotDto.setId(slot.getId());
            slotDto.setTime(slot.getTime());
            dto.getTime_Slots().add(slotDto);
        }
        return dto;
    }

}
