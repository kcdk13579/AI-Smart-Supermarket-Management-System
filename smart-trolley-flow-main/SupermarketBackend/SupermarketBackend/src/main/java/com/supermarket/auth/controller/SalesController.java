package com.supermarket.auth.controller;

import com.supermarket.auth.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

    @Autowired
    private SaleRepository saleRepository;

    @GetMapping
    public ResponseEntity<List<SaleRepository.AggregatedSale>> list() {
        return ResponseEntity.ok(saleRepository.findAggregatedSales());
    }
}
