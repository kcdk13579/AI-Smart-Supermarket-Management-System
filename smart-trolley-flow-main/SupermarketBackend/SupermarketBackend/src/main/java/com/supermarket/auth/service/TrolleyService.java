package com.supermarket.auth.service;

import com.supermarket.auth.entity.Alert;
import com.supermarket.auth.entity.Trolley;
import com.supermarket.auth.entity.User;
import com.supermarket.auth.repository.AlertRepository;
import com.supermarket.auth.repository.TrolleyRepository;
import com.supermarket.auth.repository.UserRepository;
import com.supermarket.auth.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TrolleyService {

    private static final List<String> AVAILABLE_STATUSES = Arrays.asList("inactive");

    @Autowired
    private TrolleyRepository trolleyRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertService alertService;

    /**
     * Normalize UID for storage/lookup. Handles Arduino hex (d91fab04, d91fab4),
     * human format (D9 1F AB 4). Canonical form: uppercase, no spaces, 2 hex digits per byte.
     */
    public static String normalizeUid(String uid) {
        if (uid == null || uid.trim().isEmpty()) return null;
        String s = uid.trim().toUpperCase().replaceAll("\\s+", "");
        if (!s.matches("[0-9A-F]+")) return s;
        // Pad odd-length hex so each byte is 2 digits (e.g. D91FAB4 -> D91FAB04)
        if (s.length() % 2 == 1) {
            s = s.substring(0, s.length() - 1) + "0" + s.charAt(s.length() - 1);
        }
        return s;
    }

    /** Try alternate UID form for backward compatibility (D91FAB04 <-> D91FAB4) */
    private static String alternateUidForm(String normalized) {
        if (normalized == null || !normalized.matches("[0-9A-F]+")) return null;
        if (normalized.length() == 8 && normalized.charAt(normalized.length() - 2) == '0') {
            return normalized.substring(0, 6) + normalized.charAt(7); // D91FAB04 -> D91FAB4
        }
        if (normalized.length() == 7) {
            return normalized.substring(0, 6) + "0" + normalized.charAt(6); // D91FAB4 -> D91FAB04
        }
        return null;
    }

    private Optional<Trolley> findTrolleyByUid(String normalizedUid) {
        Optional<Trolley> t = trolleyRepository.findByUid(normalizedUid);
        if (t.isEmpty()) {
            String alt = alternateUidForm(normalizedUid);
            if (alt != null) t = trolleyRepository.findByUid(alt);
        }
        return t;
    }

    public Optional<Trolley> getActiveTrolley() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return Optional.empty();
        return trolleyRepository.findByCustomerAndStatus(user, "active");
    }

    /**
     * Customer selects a trolley by RFID UID. Trolley must exist and be available.
     */
    public Trolley selectTrolley(String uid) {
        String normalizedUid = normalizeUid(uid);
        if (normalizedUid == null) {
            throw new RuntimeException("Trolley UID is required");
        }

        Trolley trolley = findTrolleyByUid(normalizedUid)
                .orElseThrow(() -> new RuntimeException("Trolley not found with UID: " + normalizedUid));

        if (!AVAILABLE_STATUSES.contains(trolley.getStatus())) {
            throw new RuntimeException("Trolley is currently in use. Please select another trolley.");
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        // Release any previous active trolley for this customer
        trolleyRepository.findByCustomerAndStatus(user, "active").ifPresent(prev -> {
            prev.setCustomer(null);
            prev.setStatus("inactive");
            trolleyRepository.save(prev);
        });

        trolley.getItems().clear();
        trolley.setCustomer(user);
        trolley.setStatus("active");
        trolley.setLastActivity(Instant.now());
        trolley.setTotalAmount(0.0);
        trolley.setWeightVerified(true);
        return trolleyRepository.save(trolley);
    }

    public List<Trolley> getAvailableTrolleys() {
        return trolleyRepository.findByUidIsNotNullAndStatusIn(AVAILABLE_STATUSES);
    }

    /**
     * Admin creates a new trolley with given UID.
     */
    public Trolley createTrolley(String uid) {
        String normalizedUid = normalizeUid(uid);
        if (normalizedUid == null || normalizedUid.isEmpty()) {
            throw new RuntimeException("Trolley UID is required");
        }
        if (findTrolleyByUid(normalizedUid).isPresent()) {
            throw new RuntimeException("Trolley with UID " + normalizedUid + " already exists");
        }
        Trolley t = new Trolley();
        t.setUid(normalizedUid);
        t.setStatus("inactive");
        t.setTotalAmount(0.0);
        t.setWeightVerified(true);
        t.setLastActivity(Instant.now());
        return trolleyRepository.save(t);
    }

    /**
     * Check if gate can open for trolley at exit (RFID scan).
     * Gate opens only if trolley has completed payment.
     */
    public boolean canGateOpen(String uid) {
        String normalizedUid = normalizeUid(uid);
        if (normalizedUid == null) return false;
        return findTrolleyByUid(normalizedUid)
                .map(t -> {
                    if ("completed".equals(t.getStatus())) {
                        t.setStatus("inactive");
                        t.setCustomer(null);
                        t.getItems().clear();
                        trolleyRepository.save(t);
                        return true;
                    }

                    Alert alert = new Alert();
                    alert.setType("unpaid_exit");
                    alert.setTrolley(t);
                    alert.setMessage("Unpaid exit attempt detected at gate.");
                    alert.setSeverity("high");
                    alert.setResolved(false);
                    alert = alertRepository.save(alert);

                    String trolleyIdStr = "TRL-" + t.getId();
                    alertService.broadcastAlert(
                            String.valueOf(alert.getId()),
                            alert.getType(),
                            trolleyIdStr,
                            alert.getMessage(),
                            alert.getSeverity(),
                            alert.getResolved()
                    );

                    return false;
                })
                .orElse(false);
    }

    public void resetAllTrolleysToInactive() {
        List<Trolley> allTrolleys = trolleyRepository.findAll();
        for (Trolley t : allTrolleys) {
            t.setStatus("inactive");
            t.setCustomer(null);
            t.getItems().clear();
        }
        trolleyRepository.saveAll(allTrolleys);
        System.out.println("DEBUG - Reset all trolleys to inactive status in database.");
    }
}
