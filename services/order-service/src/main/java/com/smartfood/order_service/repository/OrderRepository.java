package com.smartfood.order_service.repository;

import com.smartfood.order_service.domain.Order;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Daily sales grouped by date – uses a parameter for the "since" date to stay portable.
    // The function('date', ...) delegates date truncation to the Hibernate dialect.
    @Query("SELECT function('date', o.createdAt) as orderDate, COUNT(o) " +
            "FROM Order o " +
            "WHERE o.restaurantId = :restaurantId " +
            "AND o.createdAt >= :since " +
            "GROUP BY function('date', o.createdAt) " +
            "ORDER BY orderDate")
    List<Object[]> findDailySales(@Param("restaurantId") Long restaurantId,
                                  @Param("since") LocalDateTime since);

    // Total revenue in the given period – pure JPQL, no native SQL.
    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o " +
            "WHERE o.restaurantId = :restaurantId " +
            "AND o.createdAt >= :since")
    BigDecimal totalRevenueLast7Days(@Param("restaurantId") Long restaurantId,
                                     @Param("since") LocalDateTime since);

    // Top N bags (limited by Pageable) – pure JPQL, no LIMIT in query.
    @Query("SELECT o.bagId, COUNT(o) as orderCount " +
            "FROM Order o " +
            "WHERE o.restaurantId = :restaurantId " +
            "GROUP BY o.bagId " +
            "ORDER BY orderCount DESC")
    List<Object[]> findTopBags(@Param("restaurantId") Long restaurantId, Pageable pageable);
}