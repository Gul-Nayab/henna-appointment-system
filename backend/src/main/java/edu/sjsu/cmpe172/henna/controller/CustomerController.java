package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.dto.CreateCustomerRequest;
import edu.sjsu.cmpe172.henna.dto.UserResponse;
import edu.sjsu.cmpe172.henna.model.Customer;
import edu.sjsu.cmpe172.henna.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    private final UserService service;

    public CustomerController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return service.getAllCustomers();
    }

    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Integer id) {
        return service.getCustomerById(id);
    }

    @PostMapping
    public UserResponse createCustomer(@RequestBody CreateCustomerRequest request) {
        return service.createCustomer(request);
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable Integer id) {
        service.deleteCustomer(id);
    }
}