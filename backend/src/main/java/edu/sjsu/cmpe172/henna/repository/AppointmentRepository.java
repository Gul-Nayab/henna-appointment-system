package edu.sjsu.cmpe172.henna.repository;

import edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse;
import edu.sjsu.cmpe172.henna.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomerId(Integer customerId);

    List<Appointment> findByArtistId(Integer artistId);

    void deleteByCustomerId(Integer customerId);

    void deleteByArtistId(Integer artistId);

    @Query("""
                SELECT new edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse(
                    a.apptId,
                    a.appointmentStatus,
                    a.customerId,
                    customerUser.name,
                    a.artistId,
                    artistUser.name,
                    a.serviceId,
                    s.type,
                    a.slotId,
                    a.date,
                    a.startTime,
                    a.endTime,
                    a.notes
                )
                FROM Appointment a
                JOIN User customerUser ON a.customerId = customerUser.userId
                JOIN User artistUser ON a.artistId = artistUser.userId
                JOIN HennaService s ON a.serviceId = s.serviceId
                ORDER BY a.date, a.startTime
            """)
    List<AppointmentDetailsResponse> findAppointmentDetails();

    @Query("""
                SELECT new edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse(
                    a.apptId,
                    a.appointmentStatus,
                    a.customerId,
                    customerUser.name,
                    a.artistId,
                    artistUser.name,
                    a.serviceId,
                    s.type,
                    a.slotId,
                    a.date,
                    a.startTime,
                    a.endTime,
                    a.notes
                )
                FROM Appointment a
                JOIN User customerUser ON a.customerId = customerUser.userId
                JOIN User artistUser ON a.artistId = artistUser.userId
                JOIN HennaService s ON a.serviceId = s.serviceId
                WHERE a.customerId = :customerId
                ORDER BY a.date, a.startTime
            """)
    List<AppointmentDetailsResponse> findAppointmentDetailsByCustomerId(Integer customerId);

    @Query("""
                SELECT new edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse(
                    a.apptId,
                    a.appointmentStatus,
                    a.customerId,
                    customerUser.name,
                    a.artistId,
                    artistUser.name,
                    a.serviceId,
                    s.type,
                    a.slotId,
                    a.date,
                    a.startTime,
                    a.endTime,
                    a.notes
                )
                FROM Appointment a
                JOIN User customerUser ON a.customerId = customerUser.userId
                JOIN User artistUser ON a.artistId = artistUser.userId
                JOIN HennaService s ON a.serviceId = s.serviceId
                WHERE a.artistId = :artistId
                ORDER BY a.date, a.startTime
            """)
    List<AppointmentDetailsResponse> findAppointmentDetailsByArtistId(Integer artistId);
}