package com.smartfood.order_service.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class PaymentService {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    /**
     * Charge the customer using Stripe.
     * @param amount  the total amount in EUR
     * @param description a label for this payment
     * @return true if the payment succeeded, false otherwise
     */
    public boolean charge(BigDecimal amount, String description) {
        // Stripe works in the smallest currency unit (cents)
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("eur")
                .setDescription(description)
                // Use the test card 4242 4242 4242 4242 automatically
                .setPaymentMethod("pm_card_visa")   // pre‑built test payment method
                .setConfirm(true)
                .build();

        try {
            PaymentIntent intent = PaymentIntent.create(params);
            log.info("Stripe payment {} for {}: {}", intent.getId(), description, intent.getStatus());
            return "succeeded".equals(intent.getStatus());
        } catch (Exception e) {
            log.error("Stripe payment failed for {}: {}", description, e.getMessage());
            return false;
        }
    }
}