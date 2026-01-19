package com.booking_service.Service;

import com.booking_service.client.DoctorClient;
import com.booking_service.client.PatientClient;
import com.booking_service.dto.Doctor;
import com.booking_service.dto.DoctorAppointmentSchedule;
import com.booking_service.dto.Patient;
import com.booking_service.dto.Time_Slots;
import com.booking_service.entity.BookingConfirmation;
import com.booking_service.repository.BookingConfirmationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
public class BookingService {
    private DoctorClient doctorClient;
    private PatientClient patientClient;
    private BookingConfirmationRepository bookingConfirmationRepository;
    private WhatsAppService whatsAppService;
    private SmsService smsService;
    private Logger log= LoggerFactory.getLogger(BookingService.class);

    public BookingService(SmsService smsService,WhatsAppService whatsAppService,DoctorClient doctorClient, PatientClient patientClient, BookingConfirmationRepository bookingConfirmationRepository) {
        this.doctorClient = doctorClient;
        this.patientClient = patientClient;
        this.bookingConfirmationRepository = bookingConfirmationRepository;
        this.whatsAppService=whatsAppService;
        this.smsService=smsService;
    }

    public ResponseEntity<?> initiateBooking(Long doctorId, Long patientId, LocalDate date, LocalTime time) {

        Doctor doctor = doctorClient.getDoctorById(doctorId);
        if(doctor.getId()==null){
            return new ResponseEntity<>("Doctor is not found", HttpStatus.BAD_REQUEST);
        }
        Patient patient = patientClient.getPatientById(patientId);

        System.out.println(patient.getId());
        if (patient.getId()==0){
            return new ResponseEntity<>("Patient is not found",HttpStatus.BAD_REQUEST);
        }

        BookingConfirmation bookingConfirmation = new BookingConfirmation();
        bookingConfirmation.setDoctorId(doctor.getId());
        bookingConfirmation.setPatientId(patient.getId());
        bookingConfirmation.setAddress(doctor.getAddress());
        bookingConfirmation.setStatus(false);

        List<DoctorAppointmentSchedule> doctorAppointmentSchedules = doctor.getDoctorAppointmentSchedules();
        for (DoctorAppointmentSchedule doctorAppointmentSchedule : doctorAppointmentSchedules) {
            LocalDate date1 = doctorAppointmentSchedule.getDate();
            if (date1.equals(date)) {
                List<Time_Slots> timeSlots = doctorAppointmentSchedule.getTime_Slots();
                for (Time_Slots timeSlot : timeSlots) {
                    LocalTime time1 = timeSlot.getTime();
                    if (time1.equals(time)) {
                        bookingConfirmation.setDate(date);
                        bookingConfirmation.setTime(time);
                    }
                }
            }
        }
        if(bookingConfirmation.getDate()==null){
            return new ResponseEntity<>("Date is not available",HttpStatus.BAD_REQUEST);
        }
        if(bookingConfirmation.getTime()==null){
            return new ResponseEntity<>("Time is not available",HttpStatus.BAD_REQUEST);
        }
        BookingConfirmation save = bookingConfirmationRepository.save(bookingConfirmation);
        return new ResponseEntity<>(save,HttpStatus.OK);

    }

    public BookingConfirmation getBookingById(long id) {
        return bookingConfirmationRepository.findById(id).get();
    }

    public void updateBooking(BookingConfirmation bookingConfirmation) {
        bookingConfirmationRepository.save(bookingConfirmation);
        smsService.sendSms("+919058185217","dkbcd");

//        Doctor doctor = doctorClient.getDoctorById(bookingConfirmation.getDoctorId());
//        String contact = doctor.getContact();
//        whatsAppService.sendWhatsAppMessage("+919058185217","Booking is confirmed on"+bookingConfirmation.getTime());
//
//
//        Patient patient = patientClient.getPatientById(bookingConfirmation.getPatientId());
//        long contact1 = patient.getContact();
//        whatsAppService.sendWhatsAppMessage("+919058185217","Booking is confirmed on"+bookingConfirmation.getTime());

    }
}