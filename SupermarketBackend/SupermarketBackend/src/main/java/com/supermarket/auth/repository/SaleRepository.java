package com.supermarket.auth.repository;

import com.supermarket.auth.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    interface AggregatedSale {
        LocalDate getDate();
        Double getTotalSales();
        Long getTransactionCount();
    }

    @Query("SELECT s.date as date, SUM(s.totalAmount) as totalSales, COUNT(s) as transactionCount FROM Sale s GROUP BY s.date ORDER BY s.date ASC")
    List<AggregatedSale> findAggregatedSales();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.date = CURRENT_DATE")
    Double calculateTotalSalesToday();
}

