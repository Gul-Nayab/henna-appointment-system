package edu.sjsu.cmpe172.henna.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping("/")
    public List<Appointment> getAppointments() {
        return service.getAllAppointments();
    }

    @PostMapping("/")
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return service.createAppointment(appointment);
    }

    @GetMapping("/{id}")
    public Appointment getAppointmentById(@PathVariable Integer id) {
        return service.getAppointmentById(id);
    }

    @GetMapping("/customer/{customerId}")
    public List<Appointment> getAppointmentsByCustomerId(@PathVariable Integer customerId) {
        return service.getAppointmentsByCustomerId(customerId);
    }

    @GetMapping("/artists/{artistId}")
    public List<Appointment> getAppointmentsByArtistId(@PathVariable Integer artistId) {
        return service.getAppointmentsByArtistId(artistId);
    }
}
