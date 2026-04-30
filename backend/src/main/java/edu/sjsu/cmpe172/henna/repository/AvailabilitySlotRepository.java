package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Integer> {

    List<AvailabilitySlot> findByArtistId(Integer artistId);

    List<AvailabilitySlot> findByArtistIdAndDate(Integer artistId, LocalDate date);

    List<AvailabilitySlot> findByArtistIdAndIsBookedFalse(Integer artistId);

    List<AvailabilitySlot> findByArtistIdAndDateAndIsBookedFalse(Integer artistId, LocalDate date);

    Optional<AvailabilitySlot> findByArtistIdAndDateAndEndTimeAndIsBookedFalse(
            Integer artistId,
            LocalDate date,
            LocalTime endTime);

    Optional<AvailabilitySlot> findByArtistIdAndDateAndStartTimeAndIsBookedFalse(
            Integer artistId,
            LocalDate date,
            LocalTime startTime);
}