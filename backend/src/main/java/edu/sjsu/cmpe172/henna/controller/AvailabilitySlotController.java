package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import edu.sjsu.cmpe172.henna.service.AvailabilitySlotService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @GetMapping("/artists/{artistId}/availability-slots/free")
    public List<AvailabilitySlot> getFreeSlotsByArtistId(@PathVariable Integer artistId) {
        return service.getFreeSlotsByArtistId(artistId);
    }

    @GetMapping("/artists/{artistId}/availability-slots/free/{date}")
    public List<AvailabilitySlot> getFreeSlotsByArtistIdAndDate(
            @PathVariable Integer artistId,
            @PathVariable LocalDate date) {
        return service.getFreeSlotsByArtistIdAndDate(artistId, date);
    }

    @PostMapping("/artists/{artistId}/availability-slots")
    public AvailabilitySlot createSlotForArtist(
            @PathVariable Integer artistId,
            @RequestBody AvailabilitySlot slot) {
        return service.createSlotForArtist(artistId, slot);
    }

    @PutMapping("/artists/{artistId}/availability-slots/{slotId}")
    public AvailabilitySlot updateSlotForArtist(
            @PathVariable Integer artistId,
            @PathVariable Integer slotId,
            @RequestBody AvailabilitySlot updatedSlot) {
        return service.updateSlotForArtist(artistId, slotId, updatedSlot);
    }

    @DeleteMapping("/artists/{artistId}/availability-slots/{slotId}")
    public void deleteSlotForArtist(
            @PathVariable Integer artistId,
            @PathVariable Integer slotId) {
        service.deleteSlotForArtist(artistId, slotId);
    }
}