package com.example.kp_lator.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

@Service
public class MessageSenderService {

    private static final String QUEUE_METER = "Meter";
    private static final String QUEUE_INSTALLATION = "Installation";
    private static final String QUEUE_ANALOG = "Analog";  // Add Analog queue name
    private static final String QUEUE_BOX = "Box";        // Add Box queue name

    @Autowired
    private JmsTemplate jmsTemplate;

    /**
     * Sends a message to the meters queue
     *
     * @param message The message to send
     */
    public void sendMessageToMeterQueue(String message) {
        jmsTemplate.convertAndSend(QUEUE_METER, message);
    }

    /**
     * Sends a message to the installation queue
     *
     * @param message The message to send
     */
    public void sendMessageToInstallationQueue(String message) {
        jmsTemplate.convertAndSend(QUEUE_INSTALLATION, message);
    }

    /**
     * Sends a message to the analog queue
     *
     * @param message The message to send
     */
    public void sendMessageToAnalogQueue(String message) {
        jmsTemplate.convertAndSend(QUEUE_ANALOG, message);
    }

    /**
     * Sends a message to the box queue
     *
     * @param message The message to send
     */
    public void sendMessageToBoxQueue(String message) {
        jmsTemplate.convertAndSend(QUEUE_BOX, message);
    }
}