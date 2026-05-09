package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.dto.LoginUserResponse;
import edu.sjsu.cmpe172.henna.dto.UpdateUserRequest;
import edu.sjsu.cmpe172.henna.dto.UserResponse;
import edu.sjsu.cmpe172.henna.service.UserService;
import org.springframework.web.bind.annotation.*;
import edu.sjsu.cmpe172.henna.dto.UpdateAccountRequest;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return service.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Integer id) {
        return service.getUserById(id);
    }

    @GetMapping("/username/{username}")
    public LoginUserResponse getUserByUsername(@PathVariable String username) {
        return service.getLoginUserByUsername(username);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Integer id, @RequestBody UpdateUserRequest request) {
        return service.updateUser(id, request);
    }

    @PutMapping("/{id}/account")
    public UserResponse updateAccount(
            @PathVariable Integer id,
            @RequestBody UpdateAccountRequest request) {
        return service.updateAccount(id, request);
    }

    @DeleteMapping("/{id}/account")
    public void deleteAccount(@PathVariable Integer id) {
        service.deleteAccount(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Integer id) {
        service.deleteUser(id);
    }
}