package com.supermarket.auth.dto;

public class ProductDto {
    public Long id;
    public String barcode;
    public String name;
    public Double price;
    public Integer weight;
    public String category;
    public String imageUrl;

    public ProductDto() {}

    public ProductDto(Long id, String barcode, String name, Double price, Integer weight, String category, String imageUrl) {
        this.id = id;
        this.barcode = barcode;
        this.name = name;
        this.price = price;
        this.weight = weight;
        this.category = category;
        this.imageUrl = imageUrl;
    }
}
