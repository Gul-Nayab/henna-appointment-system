package edu.sjsu.cmpe172.henna.service;

import org.springframework.stereotype.Service;
import java.util.List;

import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository repo;

    public AppointmentService(AppointmentRepository repo) {
        this.repo = repo;
    }

    public List<Appointment> getAllAppointments() {
        return repo.findAll();
    }

    public Appointment getAppointmentById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public Appointment createAppointment(Appointment appointment) {
        return repo.save(appointment);
    }
}