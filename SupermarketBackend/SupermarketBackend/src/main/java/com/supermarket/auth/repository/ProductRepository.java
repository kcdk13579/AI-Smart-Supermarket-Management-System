package com.supermarket.auth.repository;

import com.supermarket.auth.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByNameAsc();

    boolean existsByBarcode(String barcode);

    Optional<Product> findByBarcode(String barcode);
}
