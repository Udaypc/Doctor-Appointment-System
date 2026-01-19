package com.doctor_service.service;

import com.doctor_service.client.AuthClient;
import com.doctor_service.dto.AuthUserRequest;
import com.doctor_service.dto.DoctorAppointmentScheduleDto;
import com.doctor_service.dto.DoctorDto;
import com.doctor_service.dto.Time_Slots_Dto;
import com.doctor_service.entity.*;
import com.doctor_service.repository.AreaRepository;
import com.doctor_service.repository.CityRepository;
import com.doctor_service.repository.DoctorRepository;
import com.doctor_service.repository.StateRepository;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService{

    private final DoctorRepository doctorRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final AreaRepository areaRepository;
    private final AuthClient authClient;

    @Transactional
    public ResponseEntity<?> registerDoctor(DoctorDto doctorDto){
        State state=new State();
        String stateName = doctorDto.getState();
        if(stateName!=null){
           state = stateRepository.findByName(stateName);
           if(state==null){
               state=new State();
               state.setName(stateName);
               stateRepository.save(state);
           }
        }else{
            return new ResponseEntity<>("State is null", HttpStatus.BAD_REQUEST);
        }

        City city=new City();
        String cityName=doctorDto.getCity();
        if(cityName!=null){
            city = cityRepository.findByName(cityName);
            if(city==null){
                city=new City();
                city.setName(cityName);
                cityRepository.save(city);
            }
        }else{
            return new ResponseEntity<>("City name not found",HttpStatus.BAD_REQUEST);
        }

        Area area=new Area();
        String areaName=doctorDto.getArea();
        if(areaName!=null){
            area=areaRepository.findByName(areaName);
            if(area==null){
                area=new Area();
                area.setName(areaName);
                areaRepository.save(area);
            }
        }
        // Creating a doctor obj......
        Doctor doctor= new Doctor();
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
        for(DoctorAppointmentScheduleDto doctorAppointmentScheduleDto:doctorAppointmentSchedules){
            DoctorAppointmentSchedule schedule= new DoctorAppointmentSchedule();
            //Add date to the schedule
            schedule.setDate(doctorAppointmentScheduleDto.getDate());
            //fetching the time_slots
            List<Time_Slots_Dto> timeSlots = doctorAppointmentScheduleDto.getTime_Slots();
            for(Time_Slots_Dto timeSlotsDto:timeSlots){
                Time_Slots t1=new Time_Slots();
                // Add time to the slot
                t1.setTime(timeSlotsDto.getTime());
                // Set schedule to the slot
                t1.setDoctorAppointmentSchedule(schedule);
                //Add slot to the schedule time_slots list
                schedule.getTime_Slots().add(t1);
            }
            doctor.getDoctorAppointmentSchedules().add(schedule);
            schedule.setDoctor(doctor);
        }

        AuthUserRequest authUserRequest=new AuthUserRequest();
        authUserRequest.setEmail(doctor.getEmail());
        authUserRequest.setPassword(doctorDto.getPassword());
        authUserRequest.setRole("Doctor");
        authUserRequest.setUsername(doctor.getName());

        authClient.registerUser(authUserRequest);

        Doctor savedDoctor = doctorRepository.save(doctor);

        return new ResponseEntity<>(savedDoctor,HttpStatus.OK);
    }

    public ResponseEntity<?> updateDoctor(Doctor doctor) {

        Doctor save = doctorRepository.save(doctor);
        return new ResponseEntity<>(save,HttpStatus.OK);
    }

    public ResponseEntity<?> deleteDoctorById(long id) {
        doctorRepository.deleteById(id);
        return new ResponseEntity<>("Deleted",HttpStatus.OK);
    }


}
