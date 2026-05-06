package edu.sjsu.cmpe172.henna.dto;

public class LoginUserResponse {
    private Integer userId;
    private String username;
    private String password;
    private String name;
    private String email;
    private String phoneNumber;
    private String role;

    public LoginUserResponse(Integer userId, String username, String password, String name, String email,
            String phoneNumber, String role) {
        this.userId = userId;
        this.username = username;
        this.password = password;
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

    public String getPassword() {
        return password;
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