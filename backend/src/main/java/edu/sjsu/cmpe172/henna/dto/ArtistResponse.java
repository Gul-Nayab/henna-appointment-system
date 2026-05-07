package edu.sjsu.cmpe172.henna.dto;

public class ArtistResponse {
    private Integer artistId;
    private String name;
    private String skillLevel;
    private String portfolioLink;
    private String bio;

    public ArtistResponse(Integer artistId, String name, String skillLevel, String portfolioLink, String bio) {
        this.artistId = artistId;
        this.name = name;
        this.skillLevel = skillLevel;
        this.portfolioLink = portfolioLink;
        this.bio = bio;
    }

    public Integer getArtistId() {
        return artistId;
    }

    public String getName() {
        return name;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public String getPortfolioLink() {
        return portfolioLink;
    }

    public String getBio() {
        return bio;
    }
}