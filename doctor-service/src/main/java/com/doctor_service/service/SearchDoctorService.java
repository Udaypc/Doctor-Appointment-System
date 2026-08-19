package com.doctor_service.service;

import com.doctor_service.dto.DoctorAppointmentScheduleDto;
import com.doctor_service.dto.DoctorDto;
import com.doctor_service.dto.Time_Slots_Dto;
import com.doctor_service.entity.Doctor;
import com.doctor_service.entity.DoctorAppointmentSchedule;
import com.doctor_service.entity.Time_Slots;
import com.doctor_service.repository.DoctorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SearchDoctorService {
    private final DoctorRepository doctorRepository;
    private final ReviewService reviewService;

    public SearchDoctorService(DoctorRepository doctorRepository, ReviewService reviewService) {
        this.doctorRepository = doctorRepository;
        this.reviewService = reviewService;
    }

    public ResponseEntity<?> searchDoctor(String specialization, String area) {
        List<Doctor> doctors = doctorRepository.searchBySpecializationAndArea(specialization, area);
        return new ResponseEntity<>(mapDoctorsToDto(doctors), HttpStatus.OK);
    }

    public ResponseEntity<?> searchBySpecialization(String specialization) {
        List<Doctor> doctors = doctorRepository.searchBySpecialization(specialization);
        return new ResponseEntity<>(mapDoctorsToDto(doctors), HttpStatus.OK);
    }

    public ResponseEntity<?> searchByCity(String city) {
        List<Doctor> doctors = doctorRepository.searchByCity(city);
        return new ResponseEntity<>(mapDoctorsToDto(doctors), HttpStatus.OK);
    }

    public ResponseEntity<?> searchBySpecializationAndCity(String specialization, String city) {
        List<Doctor> doctors = doctorRepository.searchBySpecializationAndCity(specialization, city);
        return new ResponseEntity<>(mapDoctorsToDto(doctors), HttpStatus.OK);
    }

    public ResponseEntity<?> getAvailableSlots(long doctorId, LocalDate date) {
        Optional<Doctor> optionalDoctor = doctorRepository.findById(doctorId);
        if (optionalDoctor.isEmpty()) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }
        Doctor doctor = optionalDoctor.get();
        LocalDate nowDate = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        List<Time_Slots_Dto> availableSlots = new ArrayList<>();
        for (DoctorAppointmentSchedule schedule : doctor.getDoctorAppointmentSchedules()) {
            if (schedule.getDate().equals(date)) {
                for (Time_Slots slot : schedule.getTime_Slots()) {
                    if (date.isAfter(nowDate) || slot.getTime().isAfter(nowTime)) {
                        Time_Slots_Dto dto = new Time_Slots_Dto();
                        dto.setId(slot.getId());
                        dto.setTime(slot.getTime());
                        availableSlots.add(dto);
                    }
                }
            }
        }
        return new ResponseEntity<>(availableSlots, HttpStatus.OK);
    }

    public ResponseEntity<?> getAllSpecializations() {
        List<String> specializations = doctorRepository.findAllSpecializations();
        return new ResponseEntity<>(specializations, HttpStatus.OK);
    }

    public ResponseEntity<?> getAllCities() {
        List<String> cities = doctorRepository.findAllCities();
        return new ResponseEntity<>(cities, HttpStatus.OK);
    }

    public ResponseEntity<?> getAreasByCity(String city) {
        List<String> areas = doctorRepository.findAreasByCity(city);
        return new ResponseEntity<>(areas, HttpStatus.OK);
    }

    public DoctorDto getById(long id) {
        Optional<Doctor> byId = doctorRepository.findById(id);
        if (byId.isEmpty()) {
            return new DoctorDto();
        }
        Doctor doctor = byId.get();
        List<DoctorAppointmentScheduleDto> scheduleDtos = buildScheduleDtos(doctor.getDoctorAppointmentSchedules());
        return getDoctorDto(doctor, scheduleDtos);
    }

    public ResponseEntity<?> getByEmail(String email) {
        Optional<Doctor> optionalDoctor = doctorRepository.findByEmail(email);
        if (optionalDoctor.isEmpty()) {
            return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
        }
        Doctor doctor = optionalDoctor.get();
        List<DoctorAppointmentScheduleDto> scheduleDtos = buildScheduleDtos(doctor.getDoctorAppointmentSchedules());
        return new ResponseEntity<>(getDoctorDto(doctor, scheduleDtos), HttpStatus.OK);
    }

    public ResponseEntity<?> getAllDoctor() {
        List<Doctor> all = doctorRepository.findAll();
        return new ResponseEntity<>(mapDoctorsToDto(all), HttpStatus.OK);
    }

    private List<DoctorDto> mapDoctorsToDto(List<Doctor> doctors) {
        List<DoctorDto> result = new ArrayList<>();
        for (Doctor doctor : doctors) {
            List<DoctorAppointmentScheduleDto> scheduleDtos = buildScheduleDtos(doctor.getDoctorAppointmentSchedules());
            result.add(getDoctorDto(doctor, scheduleDtos));
        }
        return result;
    }

    private List<DoctorAppointmentScheduleDto> buildScheduleDtos(List<DoctorAppointmentSchedule> schedules) {
        List<DoctorAppointmentScheduleDto> scheduleDtos = new ArrayList<>();
        LocalDate nowDate = LocalDate.now();

        for (DoctorAppointmentSchedule schedule : schedules) {
            LocalDate date = schedule.getDate();
            if (date.equals(nowDate) || date.isAfter(nowDate)) {
                DoctorAppointmentScheduleDto dto = new DoctorAppointmentScheduleDto();
                dto.setId(schedule.getId());
                dto.setDate(schedule.getDate());

                List<Time_Slots_Dto> timeSlotsDTOs = new ArrayList<>();
                for (Time_Slots timeSlot : schedule.getTime_Slots()) {
                    LocalTime now = LocalTime.now();
                    if (timeSlot.getTime().isAfter(now) || date.isAfter(nowDate)) {
                        Time_Slots_Dto slotDto = new Time_Slots_Dto();
                        slotDto.setId(timeSlot.getId());
                        slotDto.setTime(timeSlot.getTime());
                        timeSlotsDTOs.add(slotDto);
                    }
                }
                dto.setTime_Slots(timeSlotsDTOs);
                scheduleDtos.add(dto);
            }
        }
        return scheduleDtos;
    }

    private DoctorDto getDoctorDto(Doctor doctor, List<DoctorAppointmentScheduleDto> scheduleDtos) {
        DoctorDto doctorDto = new DoctorDto();
        doctorDto.setId(doctor.getId());
        doctorDto.setArea(doctor.getArea() != null ? doctor.getArea().getName() : null);
        doctorDto.setCity(doctor.getCity() != null ? doctor.getCity().getName() : null);
        doctorDto.setState(doctor.getState() != null ? doctor.getState().getName() : null);
        doctorDto.setContact(doctor.getContact());
        doctorDto.setAddress(doctor.getAddress());
        doctorDto.setName(doctor.getName());
        doctorDto.setExperience(doctor.getExperience());
        doctorDto.setSpecialization(doctor.getSpecialization());
        doctorDto.setUrl(doctor.getUrl());
        doctorDto.setQualification(doctor.getQualification());
        doctorDto.setEmail(doctor.getEmail());
        doctorDto.setDoctorAppointmentSchedules(scheduleDtos);
        if (doctor.getId() != null) {
            doctorDto.setAverageRating(reviewService.averageFor(doctor.getId()));
            doctorDto.setReviewCount(reviewService.countFor(doctor.getId()));
        }
        return doctorDto;
    }
}
