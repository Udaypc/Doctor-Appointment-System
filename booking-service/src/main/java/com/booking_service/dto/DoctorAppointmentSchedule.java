
package com.booking_service.dto;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class DoctorAppointmentSchedule {
    private Long id;
    private List<Time_Slots> time_Slots = new ArrayList<>();
    private LocalDate date;
    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<Time_Slots> getTime_Slots() {
        return time_Slots;
    }

    public void setTime_Slots(List<Time_Slots> time_Slots) {
        this.time_Slots = time_Slots;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
