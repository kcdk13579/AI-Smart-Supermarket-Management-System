package com.supermarket.auth.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Trolley associated with this sale (if any).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trolley_id")
    private Trolley trolley;

    /**
     * Customer who made the purchase (if known).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    /**
     * Business date for aggregating sales reports.
     */
    @Column(nullable = false)
    private LocalDate date;

    /**
     * Total sales amount for this transaction.
     */
    @Column(nullable = false)
    private Double totalAmount;

    public Sale() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trolley getTrolley() {
        return trolley;
    }

    public void setTrolley(Trolley trolley) {
        this.trolley = trolley;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
}

