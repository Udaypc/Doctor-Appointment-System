package com.doctor_service.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(nullable = false)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;


    @Column(name = "specialization", nullable = false)
    private String specialization;

    @Column(name="email",nullable = false)
    private String email;

    @Lob
    @Column(name = "qualification", nullable = false)
    private String qualification;

    @Column(name = "contact", nullable = false, unique = true, length = 10)
    private String contact;

    @Column(name = "experience")
    private Integer experience;

    @Lob
    @Column(name = "url", nullable = false)
    private String url;

    @Lob
    @Column(name = "address", nullable = false)
    private String address;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @JsonBackReference
    @ManyToOne(optional = false)
    @JoinColumn(name = "area_id", nullable = false)
    private Area area;

    @JsonManagedReference
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DoctorAppointmentSchedule> doctorAppointmentSchedules = new ArrayList<>();


}
