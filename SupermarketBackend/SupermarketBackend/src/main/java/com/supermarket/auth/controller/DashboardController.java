package com.supermarket.auth.controller;

import com.supermarket.auth.repository.AlertRepository;
import com.supermarket.auth.repository.SaleRepository;
import com.supermarket.auth.repository.TrolleyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private TrolleyRepository trolleyRepository;

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Double totalSalesToday = saleRepository.calculateTotalSalesToday();
        long activeTrolleys = trolleyRepository.countByStatus("active");
        long unpaidExitAttempts = alertRepository.countByTypeAndResolvedFalse("unpaid_exit");
        long weightMismatchAlerts = alertRepository.countByTypeAndResolvedFalse("weight_mismatch");

        return ResponseEntity.ok(Map.of(
                "totalSalesToday", totalSalesToday != null ? totalSalesToday : 0.0,
                "activeTrolleys", activeTrolleys,
                "unpaidExitAttempts", unpaidExitAttempts,
                "weightMismatchAlerts", weightMismatchAlerts));
    }
}
