package com.booking_service.dto;

import java.util.ArrayList;
import java.util.List;

public class Doctor {
    private Long id;
    private String name;
    private String email;
    private String specialization;
    private String qualification;
    private String contact;
    private Integer experience;
    private String url;
    private String address;
    private String state;
    private String city;
    private String area;
    private List<DoctorAppointmentSchedule> doctorAppointmentSchedules = new ArrayList<>();

    public List<DoctorAppointmentSchedule> getDoctorAppointmentSchedules() {
        return doctorAppointmentSchedules;
    }

    public void setDoctorAppointmentSchedules(List<DoctorAppointmentSchedule> doctorAppointmentSchedules) {
        this.doctorAppointmentSchedules = doctorAppointmentSchedules;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
