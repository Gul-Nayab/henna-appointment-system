package edu.sjsu.cmpe172.henna.dto;

public class UserResponse {
    private Integer userId;
    private String username;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;

    public UserResponse(Integer userId, String username, String name, String email, String phoneNumber, String role) {
        this.userId = userId;
        this.username = username;
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getRole() {
        return role;
    }
}