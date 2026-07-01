package com.supermarket.auth.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String barcode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer weight;

    private String category;

    private String imageUrl;

    /**
     * Cart items that reference this product.
     */
    @OneToMany(mappedBy = "product")
    private List<CartItem> cartItems = new ArrayList<>();

    public Product() {}

    public Product(String barcode, String name, Double price, Integer weight, String category, String imageUrl) {
        this.barcode = barcode;
        this.name = name;
        this.price = price;
        this.weight = weight;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public String getBarcode() { return barcode; }
    public String getName() { return name; }
    public Double getPrice() { return price; }
    public Integer getWeight() { return weight; }
    public String getCategory() { return category; }
    public String getImageUrl() { return imageUrl; }
    public List<CartItem> getCartItems() { return cartItems; }

    public void setId(Long id) { this.id = id; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public void setName(String name) { this.name = name; }
    public void setPrice(Double price) { this.price = price; }
    public void setWeight(Integer weight) { this.weight = weight; }
    public void setCategory(String category) { this.category = category; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setCartItems(List<CartItem> cartItems) { this.cartItems = cartItems; }
}
