package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.repository.AppointmentRepository;
import edu.sjsu.cmpe172.henna.repository.UserRepository;
import edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import edu.sjsu.cmpe172.henna.dto.AppointmentBookingResponse;
import edu.sjsu.cmpe172.henna.dto.NotificationRequest;
import edu.sjsu.cmpe172.henna.dto.NotificationResponse;
import edu.sjsu.cmpe172.henna.model.User;
import edu.sjsu.cmpe172.henna.repository.UserRepository;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final AvailabilitySlotService availabilitySlotService;
    private final UserRepository userRepo;
    private final RestTemplate restTemplate;

    public AppointmentService(
            AppointmentRepository appointmentRepo,
            AvailabilitySlotService availabilitySlotService,
            UserRepository userRepo,
            RestTemplate restTemplate) {
        this.appointmentRepo = appointmentRepo;
        this.availabilitySlotService = availabilitySlotService;
        this.userRepo = userRepo;
        this.restTemplate = restTemplate;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    public Appointment getAppointmentById(Integer id) {
        return appointmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public List<Appointment> getAppointmentsByCustomerId(Integer customerId) {
        return appointmentRepo.findByCustomerId(customerId);
    }

    public List<Appointment> getAppointmentsByArtistId(Integer artistId) {
        return appointmentRepo.findByArtistId(artistId);
    }

    public List<AppointmentDetailsResponse> getAppointmentDetailsByCustomerId(Integer customerId) {
        return appointmentRepo.findAppointmentDetailsByCustomerId(customerId);
    }

    public List<AppointmentDetailsResponse> getAppointmentDetailsByArtistId(Integer artistId) {
        return appointmentRepo.findAppointmentDetailsByArtistId(artistId);
    }

    @Transactional
    public AppointmentBookingResponse createAppointment(Appointment appointment) {
        if (appointment.getSlotId() == null) {
            throw new RuntimeException("slotId is required.");
        }

        AvailabilitySlot bookedSlot = availabilitySlotService.bookWithinSlot(
                appointment.getSlotId(),
                appointment.getStartTime(),
                appointment.getEndTime());

        appointment.setSlotId(bookedSlot.getSlotId());
        appointment.setArtistId(bookedSlot.getArtistId());
        appointment.setDate(bookedSlot.getDate());

        if (appointment.getAppointmentStatus() == null || appointment.getAppointmentStatus().isBlank()) {
            appointment.setAppointmentStatus("BOOKED");
        }

        Appointment savedAppointment = appointmentRepo.save(appointment);

        NotificationResponse notificationResponse = sendMockBookingNotification(savedAppointment);

        String notificationStatus = "UNKNOWN";
        String channelUsed = null;
        String message = "No notification response.";

        if (notificationResponse != null) {
            notificationStatus = notificationResponse.getStatus();
            channelUsed = notificationResponse.getChannelUsed();
            message = notificationResponse.getMessage();
        }

        return new AppointmentBookingResponse(
                savedAppointment,
                notificationStatus,
                channelUsed,
                message);
    }

    @Transactional
    public Appointment updateAppointment(Integer appointmentId, Appointment updatedAppointment) {
        Appointment existing = getAppointmentById(appointmentId);

        if ("CANCELLED".equalsIgnoreCase(existing.getAppointmentStatus())) {
            throw new RuntimeException("Cancelled appointments cannot be updated.");
        }

        Integer oldSlotId = existing.getSlotId();
        Integer requestedSlotId = updatedAppointment.getSlotId();

        AvailabilitySlot requestedSlotBeforeRelease = availabilitySlotService.getSlotById(requestedSlotId);

        AvailabilitySlot releasedMergedSlot = availabilitySlotService.releaseBookedSlotAndMerge(oldSlotId);

        Integer slotIdToBook = requestedSlotId;

        boolean requestedSlotWasOldSlot = requestedSlotId.equals(oldSlotId);

        boolean requestedSlotWasMergedIntoOldSlot = requestedSlotBeforeRelease.getArtistId()
                .equals(releasedMergedSlot.getArtistId())
                && requestedSlotBeforeRelease.getDate().equals(releasedMergedSlot.getDate())
                && !requestedSlotBeforeRelease.getStartTime().isBefore(releasedMergedSlot.getStartTime())
                && !requestedSlotBeforeRelease.getEndTime().isAfter(releasedMergedSlot.getEndTime());

        if (requestedSlotWasOldSlot || requestedSlotWasMergedIntoOldSlot) {
            slotIdToBook = releasedMergedSlot.getSlotId();
        }

        AvailabilitySlot newlyBookedSlot = availabilitySlotService.bookWithinSlot(
                slotIdToBook,
                updatedAppointment.getStartTime(),
                updatedAppointment.getEndTime());

        existing.setCustomerId(updatedAppointment.getCustomerId());
        existing.setArtistId(newlyBookedSlot.getArtistId());
        existing.setServiceId(updatedAppointment.getServiceId());
        existing.setSlotId(newlyBookedSlot.getSlotId());
        existing.setDate(newlyBookedSlot.getDate());
        existing.setStartTime(updatedAppointment.getStartTime());
        existing.setEndTime(updatedAppointment.getEndTime());
        existing.setNotes(updatedAppointment.getNotes());
        existing.setAppointmentStatus("BOOKED");

        return appointmentRepo.save(existing);
    }

    @Transactional
    public Appointment cancelAppointment(Integer appointmentId) {
        Appointment existing = getAppointmentById(appointmentId);

        if ("CANCELLED".equalsIgnoreCase(existing.getAppointmentStatus())) {
            return existing;
        }

        availabilitySlotService.releaseBookedSlotAndMerge(existing.getSlotId());
        existing.setAppointmentStatus("CANCELLED");

        return appointmentRepo.save(existing);
    }

    @Transactional
    public void hardDeleteAppointment(Integer appointmentId) {
        Appointment existing = getAppointmentById(appointmentId);
        appointmentRepo.delete(existing);
    }

    private NotificationResponse sendMockBookingNotification(Appointment appointment) {
        try {
            User customer = userRepo.findById(appointment.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer user not found."));

            User artist = userRepo.findById(appointment.getArtistId())
                    .orElseThrow(() -> new RuntimeException("Artist user not found."));

            NotificationRequest request = new NotificationRequest();
            request.setAppointmentId(appointment.getApptId());
            request.setCustomerName(customer.getName());
            request.setArtistName(artist.getName());
            request.setDate(appointment.getDate().toString());
            request.setStartTime(appointment.getStartTime().toString());
            request.setEndTime(appointment.getEndTime().toString());
            request.setPhoneNumber(customer.getPhoneNumber());
            request.setEmail(customer.getEmail());

            // Mock choice:
            // If phone number exists, pretend they opted into texts.
            // Otherwise, email is used.
            request.setTextOptIn(customer.getPhoneNumber() != null && !customer.getPhoneNumber().isBlank());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<NotificationRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<NotificationResponse> response = restTemplate.postForEntity(
                    "http://localhost:8080/api/mock-notifications/confirm",
                    entity,
                    NotificationResponse.class);

            return response.getBody();
        } catch (Exception error) {
            System.out.println("Mock notification failed: " + error.getMessage());

            return new NotificationResponse(
                    "FAILED",
                    "NONE",
                    "Appointment booked, but mock notification failed.");
        }
    }
}