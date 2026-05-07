package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.dto.AppointmentDetailsResponse;
import edu.sjsu.cmpe172.henna.model.Appointment;
import edu.sjsu.cmpe172.henna.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping("/appointments")
    public List<Appointment> getAppointments() {
        return service.getAllAppointments();
    }

    @GetMapping("/appointments/{id}")
    public Appointment getAppointmentById(@PathVariable Integer id) {
        return service.getAppointmentById(id);
    }

    @GetMapping("/artists/{artistId}/appointments")
    public List<AppointmentDetailsResponse> getAppointmentsByArtistId(@PathVariable Integer artistId) {
        return service.getAppointmentDetailsByArtistId(artistId);
    }

    @GetMapping("/customers/{customerId}/appointments")
    public List<AppointmentDetailsResponse> getAppointmentsByCustomerId(@PathVariable Integer customerId) {
        return service.getAppointmentDetailsByCustomerId(customerId);
    }

    @PostMapping("/appointments")
    public Appointment createAppointment(@RequestBody Appointment appointment) {
        return service.createAppointment(appointment);
    }

    @PutMapping("/appointments/{id}")
    public Appointment updateAppointment(
            @PathVariable Integer id,
            @RequestBody Appointment updatedAppointment) {
        return service.updateAppointment(id, updatedAppointment);
    }

    @PatchMapping("/appointments/{id}/cancel")
    public Appointment cancelAppointment(@PathVariable Integer id) {
        return service.cancelAppointment(id);
    }

    @DeleteMapping("/appointments/{id}")
    public void hardDeleteAppointment(@PathVariable Integer id) {
        service.hardDeleteAppointment(id);
    }
}