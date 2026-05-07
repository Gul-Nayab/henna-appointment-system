package edu.sjsu.cmpe172.henna.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDetailsResponse {
    private Integer apptId;
    private String appointmentStatus;
    private Integer customerId;
    private String customerName;
    private Integer artistId;
    private String artistName;
    private Integer serviceId;
    private String serviceType;
    private Integer slotId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;

    public AppointmentDetailsResponse(Integer apptId, String appointmentStatus,
            Integer customerId, String customerName,
            Integer artistId, String artistName,
            Integer serviceId, String serviceType,
            Integer slotId, LocalDate date,
            LocalTime startTime, LocalTime endTime,
            String notes) {
        this.apptId = apptId;
        this.appointmentStatus = appointmentStatus;
        this.customerId = customerId;
        this.customerName = customerName;
        this.artistId = artistId;
        this.artistName = artistName;
        this.serviceId = serviceId;
        this.serviceType = serviceType;
        this.slotId = slotId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
    }

    public Integer getApptId() {
        return apptId;
    }

    public String getAppointmentStatus() {
        return appointmentStatus;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Integer getArtistId() {
        return artistId;
    }

    public String getArtistName() {
        return artistName;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public String getServiceType() {
        return serviceType;
    }

    public Integer getSlotId() {
        return slotId;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public String getNotes() {
        return notes;
    }
}