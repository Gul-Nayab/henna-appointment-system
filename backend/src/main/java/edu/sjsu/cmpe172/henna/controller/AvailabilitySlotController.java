package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.service.AvailabilitySlotService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AvailabilitySlotController {

    private final AvailabilitySlotService service;

    public AvailabilitySlotController(AvailabilitySlotService service) {
        this.service = service;
    }

    @GetMapping("/availability-slots")
    public List<AvailabilitySlot> getAllSlots() {
        return service.getAllSlots();
    }

    @GetMapping("/availability-slots/{id}")
    public AvailabilitySlot getSlotById(@PathVariable Integer id) {
        return service.getSlotById(id);
    }

    @GetMapping("/artists/{artistId}/availability-slots")
    public List<AvailabilitySlot> getSlotsByArtistId(@PathVariable Integer artistId) {
        return service.getSlotsByArtistId(artistId);
    }

    @GetMapping("/artists/{artistId}/availability-slots/date/{date}")
    public List<AvailabilitySlot> getSlotsByArtistIdAndDate(
            @PathVariable Integer artistId,
            @PathVariable LocalDate date) {
        return service.getSlotsByArtistIdAndDate(artistId, date);
    }

    @PostMapping("/availability-slots")
    public AvailabilitySlot createSlot(@RequestBody AvailabilitySlot slot) {
        return service.createSlot(slot);
    }

    @DeleteMapping("/availability-slots/{id}")
    public void deleteSlot(@PathVariable Integer id) {
        service.deleteSlot(id);
    }

    @PostMapping("/availability-slots/{slotId}/split")
    public List<AvailabilitySlot> splitSlotForAppointment(
            @PathVariable Integer slotId,
            @RequestBody SplitSlotRequest request) {
        return service.splitSlotForAppointment(
                slotId,
                request.getAppointmentStart(),
                request.getAppointmentEnd());
    }

    public static class SplitSlotRequest {
        private LocalTime appointmentStart;
        private LocalTime appointmentEnd;

        public LocalTime getAppointmentStart() {
            return appointmentStart;
        }

        public void setAppointmentStart(LocalTime appointmentStart) {
            this.appointmentStart = appointmentStart;
        }

        public LocalTime getAppointmentEnd() {
            return appointmentEnd;
        }

        public void setAppointmentEnd(LocalTime appointmentEnd) {
            this.appointmentEnd = appointmentEnd;
        }
    }
}