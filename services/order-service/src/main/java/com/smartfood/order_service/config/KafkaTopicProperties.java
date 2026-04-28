package com.smartfood.order_service.config;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class KafkaTopicProperties {
    private String orderCreated;
    private String inventoryReserved;
    private String paymentProcessed;
    private String orderFailed;
    private String inventoryReleased;
    private String orderFailedDlq;
}