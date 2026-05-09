package edu.sjsu.cmpe172.henna.dto;

import edu.sjsu.cmpe172.henna.model.Appointment;

public class AppointmentBookingResponse {
    private Appointment appointment;
    private String notificationStatus;
    private String channelUsed;
    private String notificationMessage;

    public AppointmentBookingResponse(
            Appointment appointment,
            String notificationStatus,
            String channelUsed,
            String notificationMessage) {
        this.appointment = appointment;
        this.notificationStatus = notificationStatus;
        this.channelUsed = channelUsed;
        this.notificationMessage = notificationMessage;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public String getNotificationStatus() {
        return notificationStatus;
    }

    public String getChannelUsed() {
        return channelUsed;
    }

    public String getNotificationMessage() {
        return notificationMessage;
    }
}