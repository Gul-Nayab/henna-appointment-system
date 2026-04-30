package edu.sjsu.cmpe172.henna.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.repository.AppointmentRepository;
import edu.sjsu.cmpe172.henna.repository.AvailabilitySlotRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final AvailabilitySlotRepository slotRepo;

    public AppointmentService(AppointmentRepository appointmentRepo, AvailabilitySlotRepository slotRepo) {
        this.appointmentRepo = appointmentRepo;
        this.slotRepo = slotRepo;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    public Appointment getAppointmentById(Integer id) {
        return appointmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepo.save(appointment);
    }

    public List<Appointment> getAppointmentsByCustomerId(Integer customerId) {
        return appointmentRepo.findByCustomerId(customerId);
    }

    public List<Appointment> getAppointmentsByArtistId(Integer artistId) {
        List<AvailabilitySlot> artistSlots = slotRepo.findByArtistId(artistId);

        List<Integer> slotIds = artistSlots.stream()
                .map(AvailabilitySlot::getSlotId)
                .collect(Collectors.toList());

        if (slotIds.isEmpty()) {
            return List.of();
        }

        return appointmentRepo.findBySlotIdIn(slotIds);
    }
}