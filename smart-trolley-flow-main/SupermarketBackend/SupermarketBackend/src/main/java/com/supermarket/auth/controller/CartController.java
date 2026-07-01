package com.supermarket.auth.controller;

import com.supermarket.auth.entity.CartItem;
import com.supermarket.auth.repository.CartItemRepository;
import com.supermarket.auth.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartService cartService;

    @PostMapping("/items/toggle")
    public ResponseEntity<?> toggleItem(@RequestBody Map<String, String> body) {
        String barcode = body.get("barcode");
        if (barcode == null || barcode.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Barcode is required"));
        }

        try {
            cartService.toggleItem(barcode);
            return ResponseEntity.ok(Map.of("message", "Item toggled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/items/{itemId}/quantity")
    public ResponseEntity<?> updateQuantity(@PathVariable String itemId, @RequestBody Map<String, Integer> body) {
        Integer quantity = body.get("quantity");
        if (quantity == null || quantity < 1) {
            return ResponseEntity.badRequest().body("Invalid quantity");
        }

        Long id;
        try {
            id = Long.parseLong(itemId);
        } catch (NumberFormatException e) {
            // For mock frontend string IDs like "manual-xx", we'll just return OK
            // gracefully
            // without actually trying to save it to the DB so the frontend doesn't crash
            return ResponseEntity.ok(Map.of(
                    "message", "Mock item quantity updated successfully",
                    "simulated", true));
        }

        Optional<CartItem> optionalItem = cartItemRepository.findById(id);
        if (optionalItem.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            cartService.updateItemQuantity(id, quantity);
            return ResponseEntity.ok(Map.of("message", "Quantity updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        try {
            cartService.checkout();
            return ResponseEntity.ok(Map.of("message", "Checkout successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
