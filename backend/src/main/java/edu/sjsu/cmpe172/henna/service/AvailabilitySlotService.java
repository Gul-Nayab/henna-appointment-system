package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.repository.AvailabilitySlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilitySlotService {

    private final AvailabilitySlotRepository repo;

    public AvailabilitySlotService(AvailabilitySlotRepository repo) {
        this.repo = repo;
    }

    public List<AvailabilitySlot> getAllSlots() {
        return repo.findAll();
    }

    public AvailabilitySlot getSlotById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Availability slot not found with id: " + id));
    }

    public List<AvailabilitySlot> getSlotsByArtistId(Integer artistId) {
        return repo.findByArtistId(artistId);
    }

    public List<AvailabilitySlot> getSlotsByArtistIdAndDate(Integer artistId, LocalDate date) {
        return repo.findByArtistIdAndDate(artistId, date);
    }

    public AvailabilitySlot createSlot(AvailabilitySlot slot) {
        validateSlotTimes(slot.getStartTime(), slot.getEndTime());
        return repo.save(slot);
    }

    public void deleteSlot(Integer id) {
        AvailabilitySlot slot = getSlotById(id);
        repo.delete(slot);
    }

    @Transactional
    public List<AvailabilitySlot> splitSlotForAppointment(
            Integer slotId,
            LocalTime appointmentStart,
            LocalTime appointmentEnd) {
        AvailabilitySlot originalSlot = getSlotById(slotId);

        validateSlotTimes(appointmentStart, appointmentEnd);

        if (appointmentStart.isBefore(originalSlot.getStartTime())
                || appointmentEnd.isAfter(originalSlot.getEndTime())) {
            throw new RuntimeException("Appointment time is outside the selected availability slot.");
        }

        if (!appointmentStart.isBefore(appointmentEnd)) {
            throw new RuntimeException("Appointment start time must be before end time.");
        }

        List<AvailabilitySlot> newSlots = new ArrayList<>();

        // Free time before appointment
        if (appointmentStart.isAfter(originalSlot.getStartTime())) {
            AvailabilitySlot beforeSlot = new AvailabilitySlot();
            beforeSlot.setArtistId(originalSlot.getArtistId());
            beforeSlot.setDate(originalSlot.getDate());
            beforeSlot.setStartTime(originalSlot.getStartTime());
            beforeSlot.setEndTime(appointmentStart);
            newSlots.add(repo.save(beforeSlot));
        }

        // Free time after appointment
        if (appointmentEnd.isBefore(originalSlot.getEndTime())) {
            AvailabilitySlot afterSlot = new AvailabilitySlot();
            afterSlot.setArtistId(originalSlot.getArtistId());
            afterSlot.setDate(originalSlot.getDate());
            afterSlot.setStartTime(appointmentEnd);
            afterSlot.setEndTime(originalSlot.getEndTime());
            newSlots.add(repo.save(afterSlot));
        }

        // Remove original slot after new free slots are created
        repo.delete(originalSlot);

        return newSlots;
    }

    private void validateSlotTimes(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            throw new RuntimeException("Start time and end time are required.");
        }

        if (!start.isBefore(end)) {
            throw new RuntimeException("Start time must be before end time.");
        }
    }
}