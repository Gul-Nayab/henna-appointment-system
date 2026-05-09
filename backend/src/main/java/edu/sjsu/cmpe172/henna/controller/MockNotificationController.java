package edu.sjsu.cmpe172.henna.controller;

import edu.sjsu.cmpe172.henna.dto.NotificationRequest;
import edu.sjsu.cmpe172.henna.dto.NotificationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mock-notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class MockNotificationController {

    @PostMapping("/confirm")
    public ResponseEntity<NotificationResponse> sendConfirmation(
            @RequestBody NotificationRequest request) {
        String channelUsed;

        if (request.isTextOptIn()
                && request.getPhoneNumber() != null
                && !request.getPhoneNumber().isBlank()) {
            channelUsed = "TEXT";

            System.out.println(
                    "Mock TEXT sent to " + request.getPhoneNumber()
                            + " for appointment #" + request.getAppointmentId()
                            + " with " + request.getArtistName()
                            + " on " + request.getDate()
                            + " from " + request.getStartTime()
                            + " to " + request.getEndTime());
        } else {
            channelUsed = "EMAIL";

            System.out.println(
                    "Mock EMAIL sent to " + request.getEmail()
                            + " for appointment #" + request.getAppointmentId()
                            + " with " + request.getArtistName()
                            + " on " + request.getDate()
                            + " from " + request.getStartTime()
                            + " to " + request.getEndTime());
        }

        return ResponseEntity.ok(
                new NotificationResponse(
                        "SUCCESS",
                        channelUsed,
                        "Mock appointment confirmation sent."));
    }
}