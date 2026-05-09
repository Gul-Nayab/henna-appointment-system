package edu.sjsu.cmpe172.henna.dto;

public class NotificationResponse {
    private String status;
    private String channelUsed;
    private String message;

    public NotificationResponse() {
    }

    public NotificationResponse(String status, String channelUsed, String message) {
        this.status = status;
        this.channelUsed = channelUsed;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getChannelUsed() {
        return channelUsed;
    }

    public void setChannelUsed(String channelUsed) {
        this.channelUsed = channelUsed;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}