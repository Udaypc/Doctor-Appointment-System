package com.doctor_service.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DoctorDto {
    private Long id;
    private String name;
    private String specialization;
    private String qualification;
    private String contact;
    private Integer experience;
    private String email;
    private String password;
    private String url;
    private String address;
    private String state;
    private String city;
    private String area;
    private List<DoctorAppointmentScheduleDto> doctorAppointmentSchedules = new ArrayList<>();

}
