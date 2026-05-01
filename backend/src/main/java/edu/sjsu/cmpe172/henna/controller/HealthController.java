package edu.sjsu.cmpe172.henna.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();

        boolean dbUp = checkDatabase();

        response.put("status", dbUp ? "UP" : "DEGRADED");
        response.put("database", dbUp ? "UP" : "DOWN");
        response.put("service", "Henna Appointment System");
        response.put("timestamp", LocalDateTime.now().toString());

        return response;
    }

    private boolean checkDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            return connection.isValid(2);
        } catch (Exception e) {
            return false;
        }
    }
}