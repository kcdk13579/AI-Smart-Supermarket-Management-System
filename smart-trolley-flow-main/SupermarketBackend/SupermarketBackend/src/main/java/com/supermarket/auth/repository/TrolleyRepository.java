package com.supermarket.auth.repository;

import com.supermarket.auth.entity.Trolley;
import com.supermarket.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrolleyRepository extends JpaRepository<Trolley, Long> {

    Optional<Trolley> findByCustomerAndStatus(User customer, String status);

    Optional<Trolley> findByUid(String uid);

    /** Trolleys with UID that are available (inactive or completed = can be reused) */
    List<Trolley> findByUidIsNotNullAndStatusIn(List<String> statuses);

    long countByStatus(String status);
} 
