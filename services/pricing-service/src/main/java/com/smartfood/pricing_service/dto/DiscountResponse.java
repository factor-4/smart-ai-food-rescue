package com.smartfood.pricing_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class DiscountResponse {

    private Result result;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Result {
        private double discount;
    }

    // convenience getter to directly get the discount
    public double getDiscount() {
        return result != null ? result.getDiscount() : 0.0;
    }
}