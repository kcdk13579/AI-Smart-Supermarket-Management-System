package com.supermarket.auth.service;

import com.supermarket.auth.entity.Alert;
import com.supermarket.auth.entity.CartItem;
import com.supermarket.auth.entity.Trolley;
import com.supermarket.auth.repository.AlertRepository;
import com.supermarket.auth.repository.TrolleyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
@Transactional
public class IotService {

    @Autowired
    private TrolleyRepository trolleyRepository;

    @Autowired
    private TrolleyService trolleyService;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertService alertService;

    // We allow a 50 gram tolerance for sensor drift/inaccuracies by default
    private static final int WEIGHT_TOLERANCE_GRAMS = 50;

    public void processWeightReading(String uid, Double measuredWeight) {
        String normalizedUid = TrolleyService.normalizeUid(uid);
        if (normalizedUid == null) {
            throw new RuntimeException("Invalid UID");
        }

        // Find trolley
        Optional<Trolley> trolleyOpt = trolleyRepository.findByUid(normalizedUid);
        if (trolleyOpt.isEmpty()) {
            // Check alternate format
            String alt = alternateUidForm(normalizedUid);
            if (alt != null)
                trolleyOpt = trolleyRepository.findByUid(alt);

            if (trolleyOpt.isEmpty()) {
                throw new RuntimeException("Trolley not found for given UID: " + normalizedUid);
            }
        }

        Trolley trolley = trolleyOpt.get();

        if (!"active".equals(trolley.getStatus())) {
            // Usually, we only care about weight checks on an active trolley that a
            // customer is using
            return;
        }

        // Calculate expected weight
        int expectedWeight = 0;
        if (trolley.getItems() != null) {
            for (CartItem item : trolley.getItems()) {
                if ("added".equals(item.getStatus()) && item.getProduct() != null
                        && item.getProduct().getWeight() != null) {
                    expectedWeight += (item.getProduct().getWeight()
                            * (item.getQuantity() != null ? item.getQuantity() : 1));
                }
            }
        }

        boolean matched = Math.abs(expectedWeight - measuredWeight) <= WEIGHT_TOLERANCE_GRAMS;

        // If the weight verification state changed or we need to update it
        if (!matched && Boolean.TRUE.equals(trolley.getWeightVerified())) {
            // Create a weight mismatch alert
            trolley.setWeightVerified(false);

            Alert alert = new Alert();
            alert.setType("weight_mismatch");
            alert.setTrolley(trolley);
            alert.setMessage("Weight mismatch detected. Expected around " + expectedWeight + "g, but measured "
                    + measuredWeight + "g.");
            alert.setSeverity("medium");
            alert.setResolved(false);
            alert = alertRepository.save(alert);

            String trolleyIdStr = "TRL-" + trolley.getId();
            alertService.broadcastAlert(
                    String.valueOf(alert.getId()),
                    alert.getType(),
                    trolleyIdStr,
                    alert.getMessage(),
                    alert.getSeverity(),
                    alert.getResolved());
        } else if (matched && Boolean.FALSE.equals(trolley.getWeightVerified())) {
            trolley.setWeightVerified(true);

            // Mark any ongoing weight alerts as resolved
            if (trolley.getAlerts() != null) {
                for (Alert a : trolley.getAlerts()) {
                    if ("weight_mismatch".equals(a.getType()) && !a.getResolved()) {
                        a.setResolved(true);
                        alertRepository.save(a);

                        alertService.broadcastAlert(
                                String.valueOf(a.getId()),
                                a.getType(),
                                "TRL-" + trolley.getId(),
                                a.getMessage() + " (Resolved)",
                                a.getSeverity(),
                                true);
                    }
                }
            }
        }

        trolley.setLastActivity(Instant.now());
        trolleyRepository.save(trolley);

        // Broadcast trolley UI state
        String customerName = "Guest Customer";
        if (trolley.getCustomer() != null) {
            customerName = trolley.getCustomer().getName() != null ? trolley.getCustomer().getName()
                    : trolley.getCustomer().getEmail();
        }
        alertService.broadcastTrolleyUpdate("TRL-" + trolley.getId(), trolley.getStatus(), customerName,
                trolley.getTotalAmount() != null ? trolley.getTotalAmount() : 0.0, trolley.getWeightVerified());
    }

    private String alternateUidForm(String normalized) {
        if (normalized == null || !normalized.matches("[0-9A-F]+"))
            return null;
        if (normalized.length() == 8 && normalized.charAt(normalized.length() - 2) == '0') {
            return normalized.substring(0, 6) + normalized.charAt(7); // D91FAB04 -> D91FAB4
        }
        if (normalized.length() == 7) {
            return normalized.substring(0, 6) + "0" + normalized.charAt(6); // D91FAB4 -> D91FAB04
        }
        return null;
    }
}
