package com.supermarket.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class AlertService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastAlert(String id, String type, String trolleyId, String message, String severity,
            boolean resolved) {
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", id);
        alert.put("type", type);
        alert.put("trolleyId", trolleyId);
        alert.put("message", message);
        alert.put("severity", severity);
        alert.put("timestamp", Instant.now().toString());
        alert.put("resolved", resolved);

        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void broadcastTrolleyUpdate(String trolleyId, String status, String customerName, double totalAmount,
            boolean weightVerified) {
        Map<String, Object> update = new HashMap<>();
        update.put("id", trolleyId);
        update.put("status", status);
        update.put("customerName", customerName);
        update.put("totalAmount", totalAmount);
        update.put("weightVerified", weightVerified);
        update.put("lastActivity", Instant.now().toString());

        messagingTemplate.convertAndSend("/topic/trolleys", update);
    }
}
