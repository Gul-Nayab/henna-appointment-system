package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.model.HennaService;
import edu.sjsu.cmpe172.henna.service.HennaServiceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:3000")
public class HennaServiceController {

    private final HennaServiceService hennaServiceService;

    public HennaServiceController(HennaServiceService hennaServiceService) {
        this.hennaServiceService = hennaServiceService;
    }

    @GetMapping
    public List<HennaService> getAllServices() {
        return hennaServiceService.getAllServices();
    }

    @GetMapping("/{id}")
    public HennaService getServiceById(@PathVariable Integer id) {
        return hennaServiceService.getServiceById(id);
    }
}