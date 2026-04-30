package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.repository.AppointmentRepository;
import edu.sjsu.cmpe172.henna.repository.AvailabilitySlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepo;
    private final AvailabilitySlotRepository slotRepo;
    private final AvailabilitySlotService availabilitySlotService;

    public AppointmentService(
            AppointmentRepository appointmentRepo,
            AvailabilitySlotRepository slotRepo,
            AvailabilitySlotService availabilitySlotService) {
        this.appointmentRepo = appointmentRepo;
        this.slotRepo = slotRepo;
        this.availabilitySlotService = availabilitySlotService;
    }

    public List<Appointment> getAllAppointments() {
        logger.info("Fetching all appointments");
        return appointmentRepo.findAll();
    }

    public Appointment getAppointmentById(Integer id) {
        logger.info("Fetching appointment with id={}", id);
        return appointmentRepo.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Appointment not found with id={}", id);
                    return new RuntimeException("Appointment not found with id: " + id);
                });
    }

    public List<Appointment> getAppointmentsByCustomerId(Integer customerId) {
        logger.info("Fetching appointments for customerId={}", customerId);
        return appointmentRepo.findByCustomerId(customerId);
    }

    public List<Appointment> getAppointmentsByArtistId(Integer artistId) {
        logger.info("Fetching appointments for artistId={}", artistId);

        List<Integer> slotIds = slotRepo.findByArtistId(artistId)
                .stream()
                .map(AvailabilitySlot::getSlotId)
                .collect(Collectors.toList());

        if (slotIds.isEmpty()) {
            logger.info("No availability slots found for artistId={}", artistId);
            return List.of();
        }

        return appointmentRepo.findBySlotIdIn(slotIds);
    }

    @Transactional
    public Appointment createAppointment(Appointment appointment) {
        logger.info(
                "Creating appointment: customerId={}, serviceId={}, slotId={}, startTime={}, endTime={}",
                appointment.getCustomerId(),
                appointment.getServiceId(),
                appointment.getSlotId(),
                appointment.getStartTime(),
                appointment.getEndTime());

        if (appointment.getSlotId() == null) {
            logger.warn("Create appointment failed: slotId is missing for customerId={}", appointment.getCustomerId());
            throw new RuntimeException("slotId is required.");
        }

        try {
            AvailabilitySlot bookedSlot = availabilitySlotService.bookWithinSlot(
                    appointment.getSlotId(),
                    appointment.getStartTime(),
                    appointment.getEndTime());

            appointment.setSlotId(bookedSlot.getSlotId());

            Appointment saved = appointmentRepo.save(appointment);

            logger.info(
                    "Appointment created successfully: appointmentId={}, customerId={}, slotId={}",
                    saved.getApptId(),
                    saved.getCustomerId(),
                    saved.getSlotId());

            return saved;
        } catch (Exception e) {
            logger.error(
                    "Create appointment failed for customerId={}, slotId={}. Error={}",
                    appointment.getCustomerId(),
                    appointment.getSlotId(),
                    e.getMessage(),
                    e);
            throw e;
        }
    }

    @Transactional
    public Appointment updateAppointment(Integer appointmentId, Appointment updatedAppointment) {
        logger.info(
                "Updating appointmentId={} with new slotId={}, startTime={}, endTime={}",
                appointmentId,
                updatedAppointment.getSlotId(),
                updatedAppointment.getStartTime(),
                updatedAppointment.getEndTime());

        try {
            Appointment existing = getAppointmentById(appointmentId);

            logger.info("Releasing previously booked slotId={} for appointmentId={}",
                    existing.getSlotId(), appointmentId);

            availabilitySlotService.releaseBookedSlotAndMerge(existing.getSlotId());

            AvailabilitySlot newlyBookedSlot = availabilitySlotService.bookWithinSlot(
                    updatedAppointment.getSlotId(),
                    updatedAppointment.getStartTime(),
                    updatedAppointment.getEndTime());

            existing.setCustomerId(updatedAppointment.getCustomerId());
            existing.setServiceId(updatedAppointment.getServiceId());
            existing.setStatusId(updatedAppointment.getStatusId());
            existing.setDate(updatedAppointment.getDate());
            existing.setStartTime(updatedAppointment.getStartTime());
            existing.setEndTime(updatedAppointment.getEndTime());
            existing.setNotes(updatedAppointment.getNotes());
            existing.setSlotId(newlyBookedSlot.getSlotId());

            Appointment saved = appointmentRepo.save(existing);

            logger.info(
                    "Appointment updated successfully: appointmentId={}, newSlotId={}, statusId={}",
                    saved.getApptId(),
                    saved.getSlotId(),
                    saved.getStatusId());

            return saved;
        } catch (Exception e) {
            logger.error(
                    "Update appointment failed for appointmentId={}. Error={}",
                    appointmentId,
                    e.getMessage(),
                    e);
            throw e;
        }
    }

    @Transactional
    public void deleteAppointment(Integer appointmentId) {
        logger.info("Deleting appointmentId={}", appointmentId);

        try {
            Appointment existing = getAppointmentById(appointmentId);

            logger.info("Releasing slotId={} before deleting appointmentId={}",
                    existing.getSlotId(), appointmentId);

            availabilitySlotService.releaseBookedSlotAndMerge(existing.getSlotId());

            appointmentRepo.delete(existing);

            logger.info("Appointment deleted successfully: appointmentId={}", appointmentId);
        } catch (Exception e) {
            logger.error(
                    "Delete appointment failed for appointmentId={}. Error={}",
                    appointmentId,
                    e.getMessage(),
                    e);
            throw e;
        }
    }
}