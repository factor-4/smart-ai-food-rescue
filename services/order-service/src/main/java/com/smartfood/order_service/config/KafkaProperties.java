package com.smartfood.order_service.config;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KafkaProperties {
    private KafkaTopicProperties topics = new KafkaTopicProperties();
}