package edu.sjsu.cmpe172.henna.dto;

public class UpdateAccountRequest {
    private String name;
    private String email;
    private String phoneNumber;
    private String bio;
    private String portfolioLink;

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getBio() {
        return bio;
    }

    public String getPortfolioLink() {
        return portfolioLink;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setPortfolioLink(String portfolioLink) {
        this.portfolioLink = portfolioLink;
    }
}