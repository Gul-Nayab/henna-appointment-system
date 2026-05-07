package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.dto.BookingOptionResponse;
import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<AvailabilitySlot, Integer> {

    @Query("""
                SELECT new edu.sjsu.cmpe172.henna.dto.BookingOptionResponse(
                    slot.slotId,
                    artist.artistId,
                    user.name,
                    service.serviceId,
                    service.type,
                    service.duration,
                    service.price,
                    slot.date,
                    slot.startTime,
                    slot.endTime
                )
                FROM AvailabilitySlot slot
                JOIN Artist artist ON slot.artistId = artist.artistId
                JOIN User user ON artist.artistId = user.userId
                JOIN ServiceOffering offering ON artist.artistId = offering.artistId
                JOIN HennaService service ON offering.serviceId = service.serviceId
                WHERE slot.isBooked = false
                  AND (:artistId IS NULL OR artist.artistId = :artistId)
                  AND (:serviceId IS NULL OR service.serviceId = :serviceId)
                ORDER BY slot.date, slot.startTime
            """)
    List<BookingOptionResponse> findBookingOptions(
            @Param("artistId") Integer artistId,
            @Param("serviceId") Integer serviceId);
}