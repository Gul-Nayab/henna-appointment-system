package edu.sjsu.cmpe172.henna.service;

import edu.sjsu.cmpe172.henna.dto.BookingOptionResponse;
import edu.sjsu.cmpe172.henna.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public List<BookingOptionResponse> getBookingOptions(Integer artistId, Integer serviceId) {
        return bookingRepository.findBookingOptions(artistId, serviceId);
    }
}