package com.supermarket.auth.config;

import com.supermarket.auth.service.TrolleyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds initial trolleys with RFID UIDs on first run.
 */
@Component
public class TrolleyDataLoader implements CommandLineRunner {

    private static final String[] INITIAL_UIDS = { "d91fab04", "532dd505" };

    @Autowired
    private TrolleyService trolleyService;

    @Override
    public void run(String... args) {
        // Force reset any stuck trolleys so they are available for use
        try {
            trolleyService.resetAllTrolleysToInactive();
        } catch (Exception e) {
            System.err.println("Failed to reset trolleys: " + e.getMessage());
        }

        for (String uid : INITIAL_UIDS) {
            try {
                trolleyService.createTrolley(uid);
            } catch (Exception ignored) {
                // Trolley already exists
            }
        }
    }
}
