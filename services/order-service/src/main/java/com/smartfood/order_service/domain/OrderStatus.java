package com.smartfood.order_service.domain;

public enum OrderStatus {
    PENDING,
    RESERVED,
    PAID,
    CONFIRMED,
    FAILED,
    CANCELLING,
    REJECTED,
    READY,
    PICKED_UP
}