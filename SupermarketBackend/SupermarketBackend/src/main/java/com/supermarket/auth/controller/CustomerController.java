package com.supermarket.auth.controller;

import com.supermarket.auth.entity.Trolley;
import com.supermarket.auth.service.TrolleyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    @Autowired
    private TrolleyService trolleyService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        Trolley t = trolleyService.getActiveTrolley()
                .orElse(null);
        if (t == null) {
            return ResponseEntity.noContent().build();
        }

        List<Map<String, Object>> cartItems = t.getItems().stream().map(item -> {
            Map<String, Object> i = new HashMap<>();
            i.put("id", item.getId().toString());

            Map<String, Object> product = new HashMap<>();
            product.put("id", item.getProduct().getId().toString());
            product.put("name", item.getProduct().getName());
            product.put("price", item.getProduct().getPrice());
            product.put("barcode", item.getProduct().getBarcode());
            product.put("category", item.getProduct().getCategory());
            product.put("imageUrl", item.getProduct().getImageUrl());
            product.put("weight", item.getProduct().getWeight());

            i.put("product", product);
            i.put("status", item.getStatus());
            i.put("scannedAt", item.getScannedAt().toString());
            i.put("quantity", item.getQuantity());
            return i;
        }).collect(Collectors.toList());

        Map<String, Object> trolleyMap = new HashMap<>();
        trolleyMap.put("id", "TRL-" + t.getId());
        trolleyMap.put("uid", t.getUid());
        trolleyMap.put("status", t.getStatus());
        trolleyMap.put("customerId", t.getCustomer().getId().toString());
        trolleyMap.put("customerName", t.getCustomer().getName());
        trolleyMap.put("items", cartItems);
        trolleyMap.put("totalAmount", t.getTotalAmount());
        trolleyMap.put("weightVerified", t.getWeightVerified());
        trolleyMap.put("lastActivity", t.getLastActivity().toString());

        Map<String, Object> body = new HashMap<>();
        body.put("trolley", trolleyMap);
        body.put("cartItems", cartItems);
        body.put("customerName", t.getCustomer().getName());

        return ResponseEntity.ok(body);
    }

    @PostMapping("/select-trolley")
    public ResponseEntity<?> selectTrolley(@RequestBody Map<String, String> body) {
        String uid = body.get("uid");
        if (uid == null || uid.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Trolley UID is required"));
        }
        try {
            Trolley t = trolleyService.selectTrolley(uid);
            Map<String, Object> trolleyMap = new HashMap<>();
            trolleyMap.put("id", "TRL-" + t.getId());
            trolleyMap.put("uid", t.getUid());
            trolleyMap.put("status", t.getStatus());
            trolleyMap.put("customerId", t.getCustomer().getId().toString());
            trolleyMap.put("customerName", t.getCustomer().getName());
            trolleyMap.put("totalAmount", t.getTotalAmount());
            trolleyMap.put("weightVerified", t.getWeightVerified());
            trolleyMap.put("lastActivity", t.getLastActivity().toString());
            return ResponseEntity.ok(Map.of("message", "Trolley selected", "trolley", trolleyMap));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/available-trolleys")
    public ResponseEntity<?> getAvailableTrolleys() {
        List<Trolley> allAvailable = trolleyService.getAvailableTrolleys();
        System.out.println("DEBUG - allAvailable trolleys count: " + allAvailable.size());
        for (Trolley t : allAvailable) {
            System.out.println("DEBUG - Trolley: " + t.getUid() + ", Status: " + t.getStatus());
        }

        List<Map<String, Object>> trolleys = allAvailable.stream()
                .map(t -> Map.<String, Object>of(
                        "id", "TRL-" + t.getId(),
                        "uid", t.getUid() != null ? t.getUid() : "",
                        "status", t.getStatus()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("trolleys", trolleys));
    }
}
