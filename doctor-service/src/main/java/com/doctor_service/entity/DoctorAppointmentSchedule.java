package com.doctor_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class DoctorAppointmentSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private Long id;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @JsonManagedReference
    @OneToMany(mappedBy = "doctorAppointmentSchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Time_Slots> time_Slots = new ArrayList<>();

    @Column(name = "date", nullable = false)
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

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
