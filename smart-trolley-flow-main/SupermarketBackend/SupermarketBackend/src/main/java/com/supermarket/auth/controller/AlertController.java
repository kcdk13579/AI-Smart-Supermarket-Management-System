package com.supermarket.auth.controller;

import com.supermarket.auth.entity.Alert;
import com.supermarket.auth.repository.AlertRepository;
import com.supermarket.auth.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        List<Alert> allAlerts = alertRepository.findAll();
        List<Map<String, Object>> result = allAlerts.stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolve(@PathVariable String id) {
        Long alertId;
        try {
            alertId = Long.parseLong(id);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }

        return alertRepository.findById(alertId).map(alert -> {
            alert.setResolved(true);
            alertRepository.save(alert);

            String trolleyIdStr = alert.getTrolley() != null ? "TRL-" + alert.getTrolley().getId() : "";
            alertService.broadcastAlert(String.valueOf(alert.getId()), alert.getType(), trolleyIdStr, 
                    "Resolved: " + alert.getMessage(), alert.getSeverity(), true);

            return ResponseEntity.ok(toMap(alert));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/test-trigger")
    public ResponseEntity<String> triggerTestAlert() {
        String idStr = "test-" + UUID.randomUUID().toString().substring(0, 8);
        alertService.broadcastAlert(idStr, "weight_mismatch", "TRL-009", "TEST ALERT: Weight mismatch detected", "high",
                false);
        return ResponseEntity.ok("Alert triggered: " + idStr);
    }

    private Map<String, Object> toMap(Alert alert) {
        String trolleyIdStr = alert.getTrolley() != null ? "TRL-" + alert.getTrolley().getId() : "";
        return Map.of(
                "id", String.valueOf(alert.getId()),
                "type", alert.getType() != null ? alert.getType() : "system",
                "trolleyId", trolleyIdStr,
                "message", alert.getMessage() != null ? alert.getMessage() : "",
                "severity", alert.getSeverity() != null ? alert.getSeverity() : "medium",
                "timestamp", alert.getTimestamp() != null ? alert.getTimestamp().toString() : Instant.now().toString(),
                "resolved", alert.getResolved() != null ? alert.getResolved() : false
        );
    }
}
