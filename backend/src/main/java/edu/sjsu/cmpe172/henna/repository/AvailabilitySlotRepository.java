package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.model.AvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, Integer> {

    List<AvailabilitySlot> findByArtistId(Integer artistId);

    List<AvailabilitySlot> findByArtistIdAndDate(Integer artistId, LocalDate date);
}