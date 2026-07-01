package com.supermarket.auth.controller;

import com.supermarket.auth.service.TrolleyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Exit gate RFID scanner API.
 * Called when a customer scans their trolley at the exit.
 * Gate opens ONLY after payment is completed.
 */
@RestController
@RequestMapping("/api/exit")
public class ExitController {

    @Autowired
    private TrolleyService trolleyService;

    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> scanTrolley(@RequestBody Map<String, String> body) {
        String uid = body.get("uid");
        if (uid == null || uid.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "gateOpen", false,
                    "message", "Trolley UID is required"
            ));
        }

        boolean gateOpen = trolleyService.canGateOpen(uid);
        return ResponseEntity.ok(Map.of(
                "gateOpen", gateOpen,
                "message", gateOpen ? "Payment verified. Gate opening." : "Payment required. Please complete payment first."
        ));
    }
}
