package com.doctor_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalTime;

@Entity
public class Time_Slots {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private Long id;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_appointment_schedule_id", nullable = false)
    private DoctorAppointmentSchedule doctorAppointmentSchedule;

    @Column(name = "time", nullable = false)
    private LocalTime time;

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public DoctorAppointmentSchedule getDoctorAppointmentSchedule() {
        return doctorAppointmentSchedule;
    }

    public void setDoctorAppointmentSchedule(DoctorAppointmentSchedule doctorAppointmentSchedule) {
        this.doctorAppointmentSchedule = doctorAppointmentSchedule;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
