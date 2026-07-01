package com.supermarket.auth.service;

import com.supermarket.auth.entity.CartItem;
import com.supermarket.auth.entity.Product;
import com.supermarket.auth.entity.Trolley;
import com.supermarket.auth.repository.CartItemRepository;
import com.supermarket.auth.repository.ProductRepository;
import com.supermarket.auth.repository.TrolleyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private TrolleyRepository trolleyRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TrolleyService trolleyService;

    public Trolley getOrCreateActiveTrolley() {
        return trolleyService.getActiveTrolley()
                .orElseThrow(() -> new RuntimeException("Please select a trolley first"));
    }

    public void toggleItem(String barcode) {
        String normalizedBarcode = normalizeBarcode(barcode);
        if (normalizedBarcode == null || normalizedBarcode.isEmpty()) {
            throw new RuntimeException("Barcode is required");
        }
        Trolley trolley = getOrCreateActiveTrolley();
        Product product = productRepository.findByBarcode(normalizedBarcode)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existing = trolley.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId())).findFirst();

        boolean isRemoval = existing.isPresent() && "added".equals(existing.get().getStatus());
        
        // Enforce sequential product scanning: block additions if the previous item hasn't been physically verified yet
        if (!isRemoval && Boolean.FALSE.equals(trolley.getWeightVerified())) {
            throw new RuntimeException("Please place the previously scanned item in the trolley to verify its weight before adding another item.");
        }

        if (existing.isPresent()) {
            CartItem item = existing.get();
            if ("added".equals(item.getStatus())) {
                item.setStatus("removed");
            } else {
                item.setStatus("added");
                item.setScannedAt(Instant.now());
            }
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setTrolley(trolley);
            newItem.setProduct(product);
            newItem.setStatus("added");
            newItem.setQuantity(1);
            newItem.setScannedAt(Instant.now());

            trolley.getItems().add(newItem);
        }

        trolley.setTotalAmount(calculateAddedItemsTotal(trolley));
        trolley.setLastActivity(Instant.now());
        // Invalidate weight verification immediately upon cart content change
        trolley.setWeightVerified(false);
        trolleyRepository.save(trolley);
    }

    private String normalizeBarcode(String barcode) {
        if (barcode == null) {
            return null;
        }
        return barcode.replaceAll("\\s+", "");
    }

    @Autowired
    private com.supermarket.auth.repository.SaleRepository saleRepository;

    public void updateItemQuantity(Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
                
        Trolley trolley = item.getTrolley();

        // Enforce sequential product scanning: block quantity increases if weight isn't verified
        if (quantity > item.getQuantity() && Boolean.FALSE.equals(trolley.getWeightVerified())) {
            throw new RuntimeException("Please resolve the current weight mismatch before adding more items.");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        trolley.setTotalAmount(calculateAddedItemsTotal(trolley));
        trolley.setLastActivity(Instant.now());
        // Invalidate weight verification immediately upon cart content change
        trolley.setWeightVerified(false);
        trolleyRepository.save(trolley);
    }

    public void checkout() {
        Trolley trolley = getOrCreateActiveTrolley();
        
        if (Boolean.FALSE.equals(trolley.getWeightVerified())) {
            throw new RuntimeException("Cannot proceed to payment: Weight verification pending or mismatch. Please check your trolley items.");
        }

        double checkoutTotal = calculateAddedItemsTotal(trolley);
        if (checkoutTotal <= 0) {
            throw new RuntimeException("Cart is empty");
        }

        trolley.setTotalAmount(checkoutTotal);

        // Create a new Sale record
        com.supermarket.auth.entity.Sale sale = new com.supermarket.auth.entity.Sale();
        sale.setTrolley(trolley);
        sale.setCustomer(trolley.getCustomer());
        sale.setDate(java.time.LocalDate.now());
        sale.setTotalAmount(checkoutTotal);
        saleRepository.save(sale);

        // Update Trolley status
        trolley.setStatus("completed");
        trolley.setLastActivity(Instant.now());
        trolleyRepository.save(trolley);

        // Update CartItems statuses
        for (CartItem item : trolley.getItems()) {
            if ("added".equals(item.getStatus())) {
                item.setStatus("purchased");
                cartItemRepository.save(item);
            }
        }
    }

    private double calculateAddedItemsTotal(Trolley trolley) {
        return trolley.getItems().stream()
                .filter(item -> "added".equals(item.getStatus()))
                .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();
    }
}
