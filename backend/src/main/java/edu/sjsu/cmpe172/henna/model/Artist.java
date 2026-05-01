package edu.sjsu.cmpe172.henna.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @Column(name = "artist_id")
    private Integer artistId;

    @Column(name = "skill_level", nullable = false)
    private String skillLevel;

    @Column(name = "portfolio_link")
    private String portfolioLink;

    @Column(name = "bio")
    private String bio;

    public Artist() {
    }

    public Integer getArtistId() {
        return artistId;
    }

    public void setArtistId(Integer artistId) {
        this.artistId = artistId;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public String getPortfolioLink() {
        return portfolioLink;
    }

    public void setPortfolioLink(String portfolioLink) {
        this.portfolioLink = portfolioLink;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}