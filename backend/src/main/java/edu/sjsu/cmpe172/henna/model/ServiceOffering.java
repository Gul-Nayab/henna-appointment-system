package edu.sjsu.cmpe172.henna.model;

import jakarta.persistence.*;

@Entity
@Table(name = "service_offerings")
@IdClass(ServiceOfferingId.class)
public class ServiceOffering {

    @Id
    @Column(name = "artist_id")
    private Integer artistId;

    @Id
    @Column(name = "service_id")
    private Integer serviceId;

    public ServiceOffering() {
    }

    public Integer getArtistId() {
        return artistId;
    }

    public void setArtistId(Integer artistId) {
        this.artistId = artistId;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }
}