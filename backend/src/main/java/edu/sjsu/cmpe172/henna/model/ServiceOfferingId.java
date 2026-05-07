package edu.sjsu.cmpe172.henna.model;

import java.io.Serializable;
import java.util.Objects;

public class ServiceOfferingId implements Serializable {
    private Integer artistId;
    private Integer serviceId;

    public ServiceOfferingId() {
    }

    public ServiceOfferingId(Integer artistId, Integer serviceId) {
        this.artistId = artistId;
        this.serviceId = serviceId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof ServiceOfferingId))
            return false;
        ServiceOfferingId that = (ServiceOfferingId) o;
        return Objects.equals(artistId, that.artistId)
                && Objects.equals(serviceId, that.serviceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(artistId, serviceId);
    }
}