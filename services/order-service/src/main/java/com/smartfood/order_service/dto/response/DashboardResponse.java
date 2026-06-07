package com.smartfood.order_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private List<DailySale> sales;
    private BigDecimal totalRevenue;
    private List<PopularBag> popularBags;

    @Data
    @Builder
    public static class DailySale {
        private String date;
        private long count;
    }

    @Data
    @Builder
    public static class PopularBag {
        private Long bagId;
        private long orderCount;
    }
}