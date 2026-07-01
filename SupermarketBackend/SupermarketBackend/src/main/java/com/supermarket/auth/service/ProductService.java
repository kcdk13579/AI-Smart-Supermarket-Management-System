package com.supermarket.auth.service;

import com.supermarket.auth.dto.ProductDto;
import com.supermarket.auth.entity.Product;
import com.supermarket.auth.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<ProductDto> findAll() {
        return productRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ProductDto findById(Long id) {
        return productRepository.findById(id).map(this::toDto).orElse(null);
    }

    public ProductDto create(ProductDto dto) {
        String normalizedBarcode = normalizeBarcode(dto.barcode);
        Product p = new Product(
                normalizedBarcode,
                dto.name,
                dto.price != null ? dto.price : 0.0,
                dto.weight != null ? dto.weight : 0,
                dto.category,
                dto.imageUrl
        );
        p = productRepository.save(p);
        return toDto(p);
    }

    public ProductDto update(Long id, ProductDto dto) {
        return productRepository.findById(id)
                .map(p -> {
                    if (dto.barcode != null) p.setBarcode(normalizeBarcode(dto.barcode));
                    if (dto.name != null) p.setName(dto.name);
                    if (dto.price != null) p.setPrice(dto.price);
                    if (dto.weight != null) p.setWeight(dto.weight);
                    if (dto.category != null) p.setCategory(dto.category);
                    if (dto.imageUrl != null) p.setImageUrl(dto.imageUrl);
                    return productRepository.save(p);
                })
                .map(this::toDto)
                .orElse(null);
    }

    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getBarcode(),
                p.getName(),
                p.getPrice(),
                p.getWeight(),
                p.getCategory(),
                p.getImageUrl()
        );
    }

    private String normalizeBarcode(String barcode) {
        if (barcode == null) {
            return null;
        }
        return barcode.replaceAll("\\s+", "");
    }
}
