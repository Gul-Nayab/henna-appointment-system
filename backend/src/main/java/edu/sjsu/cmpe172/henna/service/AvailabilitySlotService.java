package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.repository.AvailabilitySlotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

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

    public List<AvailabilitySlot> getFreeSlotsByArtistId(Integer artistId) {
        return repo.findByArtistIdAndIsBookedFalse(artistId);
    }

    public List<AvailabilitySlot> getFreeSlotsByArtistIdAndDate(Integer artistId, LocalDate date) {
        return repo.findByArtistIdAndDateAndIsBookedFalse(artistId, date);
    }

    @Transactional
    public AvailabilitySlot createSlotForArtist(Integer artistId, AvailabilitySlot slot) {
        validateSlotTimes(slot.getStartTime(), slot.getEndTime());

        slot.setSlotId(null);
        slot.setArtistId(artistId);
        slot.setIsBooked(false);

        return repo.save(slot);
    }

    @Transactional
    public AvailabilitySlot updateSlotForArtist(Integer artistId, Integer slotId, AvailabilitySlot updatedSlot) {
        AvailabilitySlot existing = getSlotById(slotId);

        if (!existing.getArtistId().equals(artistId)) {
            throw new RuntimeException("Artist does not own this slot.");
        }

        if (Boolean.TRUE.equals(existing.getIsBooked())) {
            throw new RuntimeException("Booked slots cannot be directly edited.");
        }

        validateSlotTimes(updatedSlot.getStartTime(), updatedSlot.getEndTime());

        existing.setDate(updatedSlot.getDate());
        existing.setStartTime(updatedSlot.getStartTime());
        existing.setEndTime(updatedSlot.getEndTime());

        return repo.save(existing);
    }

    @Transactional
    public void deleteSlotForArtist(Integer artistId, Integer slotId) {
        AvailabilitySlot existing = getSlotById(slotId);

        if (!existing.getArtistId().equals(artistId)) {
            throw new RuntimeException("Artist does not own this slot.");
        }

        if (Boolean.TRUE.equals(existing.getIsBooked())) {
            throw new RuntimeException("Booked slots cannot be deleted.");
        }

        repo.delete(existing);
    }

    @Transactional
    public AvailabilitySlot bookWithinSlot(
            Integer slotId,
            LocalTime appointmentStart,
            LocalTime appointmentEnd) {
        AvailabilitySlot originalSlot = getSlotById(slotId);

        if (Boolean.TRUE.equals(originalSlot.getIsBooked())) {
            throw new RuntimeException("Selected slot is already booked.");
        }

        validateSlotTimes(appointmentStart, appointmentEnd);

        if (appointmentStart.isBefore(originalSlot.getStartTime())
                || appointmentEnd.isAfter(originalSlot.getEndTime())) {
            throw new RuntimeException("Appointment time is outside the selected availability slot.");
        }

        LocalTime oldStart = originalSlot.getStartTime();
        LocalTime oldEnd = originalSlot.getEndTime();

        if (appointmentStart.isAfter(oldStart)) {
            AvailabilitySlot beforeSlot = new AvailabilitySlot();
            beforeSlot.setArtistId(originalSlot.getArtistId());
            beforeSlot.setDate(originalSlot.getDate());
            beforeSlot.setStartTime(oldStart);
            beforeSlot.setEndTime(appointmentStart);
            beforeSlot.setIsBooked(false);
            repo.save(beforeSlot);
        }

        if (appointmentEnd.isBefore(oldEnd)) {
            AvailabilitySlot afterSlot = new AvailabilitySlot();
            afterSlot.setArtistId(originalSlot.getArtistId());
            afterSlot.setDate(originalSlot.getDate());
            afterSlot.setStartTime(appointmentEnd);
            afterSlot.setEndTime(oldEnd);
            afterSlot.setIsBooked(false);
            repo.save(afterSlot);
        }

        originalSlot.setStartTime(appointmentStart);
        originalSlot.setEndTime(appointmentEnd);
        originalSlot.setIsBooked(true);

        return repo.save(originalSlot);
    }

    @Transactional
    public AvailabilitySlot releaseBookedSlotAndMerge(Integer slotId) {
        AvailabilitySlot bookedSlot = getSlotById(slotId);

        if (!Boolean.TRUE.equals(bookedSlot.getIsBooked())) {
            throw new RuntimeException("Slot is not booked.");
        }

        Integer artistId = bookedSlot.getArtistId();
        LocalDate date = bookedSlot.getDate();
        LocalTime mergedStart = bookedSlot.getStartTime();
        LocalTime mergedEnd = bookedSlot.getEndTime();

        Optional<AvailabilitySlot> previous = repo.findByArtistIdAndDateAndEndTimeAndIsBookedFalse(artistId, date,
                mergedStart);

        if (previous.isPresent()) {
            AvailabilitySlot prevSlot = previous.get();
            mergedStart = prevSlot.getStartTime();
            repo.delete(prevSlot);
        }

        Optional<AvailabilitySlot> next = repo.findByArtistIdAndDateAndStartTimeAndIsBookedFalse(artistId, date,
                mergedEnd);

        if (next.isPresent()) {
            AvailabilitySlot nextSlot = next.get();
            mergedEnd = nextSlot.getEndTime();
            repo.delete(nextSlot);
        }

        bookedSlot.setStartTime(mergedStart);
        bookedSlot.setEndTime(mergedEnd);
        bookedSlot.setIsBooked(false);

        return repo.save(bookedSlot);
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