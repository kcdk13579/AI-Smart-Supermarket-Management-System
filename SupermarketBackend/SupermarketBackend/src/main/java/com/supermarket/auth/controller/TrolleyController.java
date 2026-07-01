package com.supermarket.auth.controller;

import com.supermarket.auth.entity.Trolley;
import com.supermarket.auth.repository.TrolleyRepository;
import com.supermarket.auth.service.AlertService;
import com.supermarket.auth.service.TrolleyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trolleys")
public class TrolleyController {

    @Autowired
    private AlertService alertService;

    @Autowired
    private TrolleyRepository trolleyRepository;

    @Autowired
    private TrolleyService trolleyService;

    private Long parseId(String idStr) {
        if (idStr != null && idStr.startsWith("TRL-")) {
            try { return Long.parseLong(idStr.substring(4)); } catch (NumberFormatException e) { return -1L; }
        }
        try { return Long.parseLong(idStr); } catch (NumberFormatException e) { return -1L; }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list() {
        List<Trolley> allTrolleys = trolleyRepository.findAll();
        List<Map<String, Object>> result = allTrolleys.stream()
                .map(this::toMap)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(@PathVariable String id) {
        Long trolleyId = parseId(id);
        return trolleyRepository.findById(trolleyId)
                .map(t -> ResponseEntity.ok(toMap(t)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String uid = body.get("uid");
        if (uid == null || uid.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Trolley UID is required"));
        }
        try {
            Trolley t = trolleyService.createTrolley(uid);
            return ResponseEntity.ok(toMap(t));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/test-update")
    public ResponseEntity<String> testUpdate(@PathVariable String id,
            @RequestParam(defaultValue = "active") String status,
            @RequestParam(required = false) String name) {

        Long trolleyId = parseId(id);
        Trolley t = trolleyRepository.findById(trolleyId).orElse(null);
        if (t == null) return ResponseEntity.notFound().build();

        String customerName = name;
        if (customerName == null) {
            customerName = "Guest Customer";
            if (t.getCustomer() != null) {
                customerName = t.getCustomer().getName() != null ? t.getCustomer().getName() : t.getCustomer().getEmail();
            }
        }

        alertService.broadcastTrolleyUpdate("TRL-" + trolleyId, status, customerName, t.getTotalAmount() != null ? t.getTotalAmount() : 0.0, t.getWeightVerified() != null ? t.getWeightVerified() : false);
        return ResponseEntity.ok("Trolley update triggered for TRL-" + trolleyId + " with name " + customerName);
    }

    private Map<String, Object> toMap(Trolley t) {
        String customerName = "Guest Customer";
        String customerId = "";
        if (t.getCustomer() != null) {
            customerName = t.getCustomer().getName() != null ? t.getCustomer().getName() : t.getCustomer().getEmail();
            customerId = String.valueOf(t.getCustomer().getId());
        }

        List<Map<String, Object>> itemsList = t.getItems() != null ? t.getItems().stream().map(item -> {
            return Map.<String, Object>of(
                "id", String.valueOf(item.getId()),
                "status", item.getStatus(),
                "product", item.getProduct() != null ? Map.of(
                    "id", String.valueOf(item.getProduct().getId()),
                    "name", item.getProduct().getName(),
                    "price", item.getProduct().getPrice(),
                    "barcode", item.getProduct().getBarcode() != null ? item.getProduct().getBarcode() : ""
                ) : Map.of(),
                "quantity", item.getQuantity() != null ? item.getQuantity() : 1,
                "scannedAt", item.getScannedAt() != null ? item.getScannedAt().toString() : ""
            );
        }).collect(Collectors.toList()) : List.of();

        return Map.<String, Object>of(
                "id", "TRL-" + t.getId(),
                "uid", t.getUid() != null ? t.getUid() : "",
                "status", t.getStatus(),
                "customerId", customerId,
                "customerName", customerName,
                "items", itemsList,
                "totalAmount", t.getTotalAmount() != null ? t.getTotalAmount() : 0.0,
                "weightVerified", t.getWeightVerified() != null ? t.getWeightVerified() : false,
                "lastActivity", t.getLastActivity() != null ? t.getLastActivity().toString() : ""
        );
    }
}
