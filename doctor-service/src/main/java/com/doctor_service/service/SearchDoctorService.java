package com.doctor_service.service;

import com.doctor_service.dto.DoctorAppointmentScheduleDto;
import com.doctor_service.dto.DoctorDto;
import com.doctor_service.dto.Time_Slots_Dto;
import com.doctor_service.entity.Doctor;
import com.doctor_service.entity.DoctorAppointmentSchedule;
import com.doctor_service.entity.Time_Slots;
import com.doctor_service.repository.AreaRepository;
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
    private AreaRepository areaRepository;

    public SearchDoctorService(DoctorRepository doctorRepository, AreaRepository areaRepository) {
        this.doctorRepository = doctorRepository;
        this.areaRepository = areaRepository;
    }

    public ResponseEntity<?> searchDoctor(String specialization , String area){
        //Fetching the doctors based on area and specialization
        List<Doctor> doctors = doctorRepository.searchBySpecializationAndArea(specialization,area);

        //Create a doctorDto list to store all doctors with valid date and valid time
        List<DoctorDto> AllValidDoctors=new ArrayList<>();

        
        for(Doctor doctor:doctors){
            //Create a scheduleDtos to store all valid date 
            List<DoctorAppointmentScheduleDto> scheduleDtos=new ArrayList<>();
            // Fetching the doctorAppointmentSchedules to the every doctor
            List<DoctorAppointmentSchedule> doctorAppointmentSchedules = doctor.getDoctorAppointmentSchedules();
            for(DoctorAppointmentSchedule schedule :doctorAppointmentSchedules){
                // Fetching the date to the every schedule
                LocalDate date = schedule.getDate();
                // Fetching the all time_slots to the every schedule
                List<Time_Slots> timeSlots = schedule.getTime_Slots();
                // Getting the current date
                LocalDate nowDate = LocalDate.now();
                // Checking whether the date is valid or not 
                if(date.equals(nowDate) || date.isAfter(nowDate)){
                    // Creating the doctorAppointmentSchedule to store the schedule info like date, id, all time_slots
                    DoctorAppointmentScheduleDto doctorAppointmentScheduleDto=new DoctorAppointmentScheduleDto();
                    // Setting the id 
                    doctorAppointmentScheduleDto.setId(schedule.getId());
                    // Setting the date 
                    doctorAppointmentScheduleDto.setDate(schedule.getDate());
                    // Creating timeSlotsDTOs to store all valid time
                    List<Time_Slots_Dto> timeSlotsDTOs=new ArrayList<>();
                    for(Time_Slots timeSlot:timeSlots){
                        // Getting the current time
                        LocalTime time=LocalTime.now();
                        // Checking whether the time is valid or not 
                        if(timeSlot.getTime().isAfter(time)||date.isAfter(nowDate)){
                            Time_Slots_Dto time_slot=new Time_Slots_Dto();
                            time_slot.setId(timeSlot.getId());
                            time_slot.setTime(timeSlot.getTime());
                            timeSlotsDTOs.add(time_slot);
                        }
                    }
                    doctorAppointmentScheduleDto.setTime_Slots(timeSlotsDTOs);
                    scheduleDtos.add(doctorAppointmentScheduleDto);
                }
            }
            
            // Setting the doctor's details
            DoctorDto doctorDto = getDoctorDto(doctor, scheduleDtos);

            // Set the doctor to the list
            AllValidDoctors.add(doctorDto);
            
        }
        return new ResponseEntity<>(AllValidDoctors, HttpStatus.OK);
    }

    private static DoctorDto getDoctorDto(Doctor doctor, List<DoctorAppointmentScheduleDto> scheduleDtos) {
        DoctorDto doctorDto=new DoctorDto();
        doctorDto.setId(doctor.getId());
        doctorDto.setArea(doctor.getArea().getName());
        doctorDto.setCity(doctor.getCity().getName());
        doctorDto.setState(doctor.getState().getName());
        doctorDto.setContact(doctor.getContact());
        doctorDto.setAddress(doctor.getAddress());
        doctorDto.setName(doctor.getName());
        doctorDto.setExperience(doctor.getExperience());
        doctorDto.setSpecialization(doctor.getSpecialization());
        doctorDto.setUrl(doctor.getUrl());
        doctorDto.setQualification(doctor.getQualification());
        doctorDto.setDoctorAppointmentSchedules(scheduleDtos);
        return doctorDto;
    }

    public Doctor getById(long id) {
        Optional<Doctor> byId = doctorRepository.findById(id);
        return byId.orElseGet(Doctor::new);
    }

    public ResponseEntity<?> getAllDoctor() {
        List<Doctor> all = doctorRepository.findAll();
        return  new ResponseEntity<>(all,HttpStatus.OK);
    }
}
