package com.smartfood.order_service.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentConfirmParams;
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

    public boolean charge(BigDecimal amount, String description) {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        try {
            // Step 1: Create a PaymentIntent with automatic payment methods (no redirects)
            PaymentIntentCreateParams createParams = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("eur")
                    .setDescription(description)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .setAllowRedirects(PaymentIntentCreateParams.AutomaticPaymentMethods.AllowRedirects.NEVER)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(createParams);

            // Step 2: Confirm it using the pre‑built test payment method (no raw card numbers)
            PaymentIntentConfirmParams confirmParams = PaymentIntentConfirmParams.builder()
                    .setPaymentMethod("pm_card_visa")   // Stripe’s magic test card
                    .build();

            intent = intent.confirm(confirmParams);
            log.info("Stripe payment {} for {}: {}", intent.getId(), description, intent.getStatus());
            return "succeeded".equals(intent.getStatus());
        } catch (Exception e) {
            log.error("Stripe payment failed for {}: {}", description, e.getMessage());
            return false;
        }
    }
}