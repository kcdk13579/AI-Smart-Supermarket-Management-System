package com.supermarket.auth.repository;

import com.supermarket.auth.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    long countByTypeAndResolvedFalse(String type);
}
