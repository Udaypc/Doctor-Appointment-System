package com.doctor_service.dto;



import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class DoctorAppointmentScheduleDto {
    private Long id;
    private List<Time_Slots_Dto> time_Slots = new ArrayList<>();
    private LocalDate date;
}
