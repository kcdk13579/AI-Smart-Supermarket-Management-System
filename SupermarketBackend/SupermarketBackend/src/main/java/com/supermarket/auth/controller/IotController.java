package com.supermarket.auth.controller;

import com.supermarket.auth.service.IotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/iot")
public class IotController {

    @Autowired
    private IotService iotService;

    @PostMapping("/weight")
    public ResponseEntity<?> updateWeight(@RequestBody Map<String, Object> body) {
        String uid = (String) body.get("trolleyUid");
        Number weightNum = (Number) body.get("weight");

        if (uid == null || uid.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "trolleyUid is required"));
        }
        if (weightNum == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "weight is required"));
        }

        try {
            iotService.processWeightReading(uid, weightNum.doubleValue());
            return ResponseEntity.ok(Map.of("message", "Weight reading processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
