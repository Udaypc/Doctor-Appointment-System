package com.booking_service.Service;

import com.booking_service.client.DoctorClient;
import com.booking_service.client.PatientClient;
import com.booking_service.dto.Doctor;
import com.booking_service.dto.DoctorAppointmentSchedule;
import com.booking_service.dto.Patient;
import com.booking_service.dto.Time_Slots;
import com.booking_service.entity.BookingConfirmation;
import com.booking_service.entity.BookingStatus;
import com.booking_service.repository.BookingConfirmationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    private final DoctorClient doctorClient;
    private final PatientClient patientClient;
    private final BookingConfirmationRepository bookingConfirmationRepository;
    private final WhatsAppService whatsAppService;
    private final SmsService smsService;
    private final Logger log = LoggerFactory.getLogger(BookingService.class);

    public BookingService(SmsService smsService, WhatsAppService whatsAppService,
                          DoctorClient doctorClient, PatientClient patientClient,
                          BookingConfirmationRepository bookingConfirmationRepository) {
        this.doctorClient = doctorClient;
        this.patientClient = patientClient;
        this.bookingConfirmationRepository = bookingConfirmationRepository;
        this.whatsAppService = whatsAppService;
        this.smsService = smsService;
    }

    public ResponseEntity<?> initiateBooking(Long doctorId, Long patientId, LocalDate date, LocalTime time) {
        Doctor doctor = doctorClient.getDoctorById(doctorId);
        if (doctor.getId() == null) {
            return new ResponseEntity<>("Doctor is not found", HttpStatus.BAD_REQUEST);
        }

        Patient patient = patientClient.getPatientById(patientId);
        if (patient == null || patient.getId() == null || patient.getId() == 0) {
            return new ResponseEntity<>("Patient is not found", HttpStatus.BAD_REQUEST);
        }

        boolean alreadyBooked = bookingConfirmationRepository.existsByDoctorIdAndDateAndTimeAndStatusIn(
                doctorId,
                date,
                time,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );
        if (alreadyBooked) {
            return new ResponseEntity<>("This slot is already booked", HttpStatus.CONFLICT);
        }

        BookingConfirmation bookingConfirmation = new BookingConfirmation();
        bookingConfirmation.setDoctorId(doctor.getId());
        bookingConfirmation.setPatientId(patient.getId());
        bookingConfirmation.setAddress(doctor.getAddress());
        bookingConfirmation.setStatus(BookingStatus.CONFIRMED);
        bookingConfirmation.setDoctorName(doctor.getName());
        bookingConfirmation.setPatientName(patient.getName());
        bookingConfirmation.setSpecialization(doctor.getSpecialization());

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

        if (bookingConfirmation.getDate() == null) {
            return new ResponseEntity<>("Date is not available", HttpStatus.BAD_REQUEST);
        }
        if (bookingConfirmation.getTime() == null) {
            return new ResponseEntity<>("Time is not available", HttpStatus.BAD_REQUEST);
        }

        BookingConfirmation save = bookingConfirmationRepository.save(bookingConfirmation);
        return new ResponseEntity<>(save, HttpStatus.OK);
    }

    public ResponseEntity<?> getBookingById(long id) {
        Optional<BookingConfirmation> booking = bookingConfirmationRepository.findById(id);
        return booking
                .<ResponseEntity<?>>map(b -> new ResponseEntity<>(b, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>("Booking not found", HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<?> getBookingsByPatientId(long patientId) {
        List<BookingConfirmation> bookings = bookingConfirmationRepository.findByPatientId(patientId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    public ResponseEntity<?> getBookingsByDoctorId(long doctorId) {
        List<BookingConfirmation> bookings = bookingConfirmationRepository.findByDoctorId(doctorId);
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    public ResponseEntity<?> cancelBooking(long id) {
        Optional<BookingConfirmation> optionalBooking = bookingConfirmationRepository.findById(id);
        if (optionalBooking.isEmpty()) {
            return new ResponseEntity<>("Booking not found", HttpStatus.NOT_FOUND);
        }
        BookingConfirmation booking = optionalBooking.get();
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            return new ResponseEntity<>("Cannot cancel a completed booking", HttpStatus.BAD_REQUEST);
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return new ResponseEntity<>("Booking is already cancelled", HttpStatus.BAD_REQUEST);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingConfirmationRepository.save(booking);
        return new ResponseEntity<>("Booking cancelled successfully", HttpStatus.OK);
    }

    public void updateBooking(BookingConfirmation bookingConfirmation) {
        bookingConfirmationRepository.save(bookingConfirmation);
        smsService.sendSms("+919058185217", "dkbcd");
    }

    public ResponseEntity<?> getAllBookings() {
        List<BookingConfirmation> all = bookingConfirmationRepository.findAll();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }
}
