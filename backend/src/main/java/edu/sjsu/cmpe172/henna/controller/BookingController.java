package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.dto.BookingOptionResponse;
import edu.sjsu.cmpe172.henna.service.BookingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking-options")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookingOptionResponse> getBookingOptions(
            @RequestParam(required = false) Integer artistId,
            @RequestParam(required = false) Integer serviceId) {
        return service.getBookingOptions(artistId, serviceId);
    }
}