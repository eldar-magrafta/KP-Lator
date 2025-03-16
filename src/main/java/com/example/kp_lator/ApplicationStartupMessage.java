package com.example.kp_lator;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Component
public class ApplicationStartupMessage {

    @EventListener(ApplicationReadyEvent.class)
    public void displayApplicationUrl() {
        try {
            // Print a blank line for spacing
            System.out.println();

            // Read and print the banner
            ClassPathResource resource = new ClassPathResource("banner.txt");
            String banner = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))
                    .lines()
                    .collect(Collectors.joining(System.lineSeparator()));

            System.out.println(banner);

            // Print the application URL message
            System.out.println("\nPlease visit http://localhost:8080 in your browser");
            System.out.println("Press Ctrl+C to stop the application");

        } catch (Exception e) {
            // Fallback if banner loading fails
            System.out.println("\nApplication started successfully!");
            System.out.println("Please visit http://localhost:8080 in your browser");
            System.out.println("Press Ctrl+C to stop the application");
        }
    }
}