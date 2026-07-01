package com.supermarket.auth.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trolleys")
public class Trolley {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Trolley status in the system.
     * Examples: active, inactive, payment_pending, completed.
     */
    @Column(nullable = false)
    private String status;

    /**
     * Customer who owns/uses this trolley.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    /**
     * Items currently associated with this trolley.
     */
    @OneToMany(mappedBy = "trolley", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> items = new ArrayList<>();

    /**
     * Alerts raised for this trolley (e.g. weight mismatch, unpaid exit).
     */
    @OneToMany(mappedBy = "trolley", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alert> alerts = new ArrayList<>();

    /**
     * Sales associated with this trolley (e.g. completed checkouts).
     */
    @OneToMany(mappedBy = "trolley", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sale> sales = new ArrayList<>();

    @Column(nullable = false)
    private Double totalAmount = 0.0;

    @Column(nullable = false)
    private Boolean weightVerified = Boolean.FALSE;

    @Column(nullable = false)
    private Instant lastActivity = Instant.now();

    /**
     * RFID UID of the physical trolley (e.g. "D9 1F AB 4", "53 2D D5 5").
     * Used for trolley selection and exit gate scanning.
     */
    @Column(unique = true)
    private String uid;

    public Trolley() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    public List<Alert> getAlerts() {
        return alerts;
    }

    public void setAlerts(List<Alert> alerts) {
        this.alerts = alerts;
    }

    public List<Sale> getSales() {
        return sales;
    }

    public void setSales(List<Sale> sales) {
        this.sales = sales;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Boolean getWeightVerified() {
        return weightVerified;
    }

    public void setWeightVerified(Boolean weightVerified) {
        this.weightVerified = weightVerified;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }
}

