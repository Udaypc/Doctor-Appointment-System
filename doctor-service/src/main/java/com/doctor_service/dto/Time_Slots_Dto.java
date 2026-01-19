package com.doctor_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class Time_Slots_Dto {
    private Long id;
    private LocalTime time;
}
