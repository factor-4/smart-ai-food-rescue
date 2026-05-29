package com.smartfood.pricing_service.repository;

import com.smartfood.pricing_service.domain.Bag;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BagRepository extends JpaRepository<Bag, Long> {

    List<Bag> findByStatus(String status);
}