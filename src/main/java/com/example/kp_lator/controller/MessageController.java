package com.example.kp_lator.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.kp_lator.service.MessageSenderService;

@RestController
@CrossOrigin(origins = "*") // Moving this to class level to apply to all endpoints
public class MessageController {

    @Autowired
    private MessageSenderService messageSenderService;

    @PostMapping("/api/queue/meter")
    public ResponseEntity<String> sendMeterMessage(@RequestParam("message") String message) {
        try {
            messageSenderService.sendMessageToMeterQueue(message);
            return ResponseEntity.ok("Meter message sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/api/queue/installation")
    public ResponseEntity<String> sendInstallationMessage(@RequestParam("message") String message) {
        try {
            messageSenderService.sendMessageToInstallationQueue(message);
            return ResponseEntity.ok("Installation message sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/api/queue/analog")
    public ResponseEntity<String> sendAnalogMessage(@RequestParam("message") String message) {
        try {
            messageSenderService.sendMessageToAnalogQueue(message);
            return ResponseEntity.ok("Analog message sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/api/queue/box")
    public ResponseEntity<String> sendBoxMessage(@RequestParam("message") String message) {
        try {
            messageSenderService.sendMessageToBoxQueue(message);
            return ResponseEntity.ok("Box message sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}