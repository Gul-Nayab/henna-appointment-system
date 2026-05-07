package edu.sjsu.cmpe172.henna.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingOptionResponse {
    private Integer slotId;
    private Integer artistId;
    private String artistName;
    private Integer serviceId;
    private String serviceType;
    private Integer duration;
    private BigDecimal price;
    private LocalDate date;
    private LocalTime slotStartTime;
    private LocalTime slotEndTime;

    public BookingOptionResponse(
            Integer slotId,
            Integer artistId,
            String artistName,
            Integer serviceId,
            String serviceType,
            Integer duration,
            BigDecimal price,
            LocalDate date,
            LocalTime slotStartTime,
            LocalTime slotEndTime) {
        this.slotId = slotId;
        this.artistId = artistId;
        this.artistName = artistName;
        this.serviceId = serviceId;
        this.serviceType = serviceType;
        this.duration = duration;
        this.price = price;
        this.date = date;
        this.slotStartTime = slotStartTime;
        this.slotEndTime = slotEndTime;
    }

    public Integer getSlotId() {
        return slotId;
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

    public Integer getDuration() {
        return duration;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public LocalDate getDate() {
        return date;
    }

    public LocalTime getSlotStartTime() {
        return slotStartTime;
    }

    public LocalTime getSlotEndTime() {
        return slotEndTime;
    }
}