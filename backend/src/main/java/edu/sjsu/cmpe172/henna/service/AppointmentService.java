package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.repository.AppointmentRepository;
import edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final AvailabilitySlotService availabilitySlotService;

    public AppointmentService(
            AppointmentRepository appointmentRepo,
            AvailabilitySlotService availabilitySlotService) {
        this.appointmentRepo = appointmentRepo;
        this.availabilitySlotService = availabilitySlotService;
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
    public Appointment createAppointment(Appointment appointment) {
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

        return appointmentRepo.save(appointment);
    }

    @Transactional
    public Appointment updateAppointment(Integer appointmentId, Appointment updatedAppointment) {
        Appointment existing = getAppointmentById(appointmentId);

        if ("CANCELLED".equalsIgnoreCase(existing.getAppointmentStatus())) {
            throw new RuntimeException("Cancelled appointments cannot be updated.");
        }

        availabilitySlotService.releaseBookedSlotAndMerge(existing.getSlotId());

        AvailabilitySlot newlyBookedSlot = availabilitySlotService.bookWithinSlot(
                updatedAppointment.getSlotId(),
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
}