package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomerId(Integer customerId);

    List<Appointment> findBySlotIdIn(List<Integer> slotIds);
}