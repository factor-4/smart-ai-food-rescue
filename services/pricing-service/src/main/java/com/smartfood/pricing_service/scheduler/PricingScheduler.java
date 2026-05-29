package com.smartfood.pricing_service.scheduler;

import com.smartfood.pricing_service.domain.Bag;
import com.smartfood.pricing_service.dto.DiscountResponse;
import com.smartfood.pricing_service.repository.BagRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
@Slf4j
public class PricingScheduler {

    private final BagRepository bagRepository;
    private final WebClient.Builder webClientBuilder;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private final String mcpUrl;
    private final String priceUpdatedTopic;

    public PricingScheduler(BagRepository bagRepository,
                            WebClient.Builder webClientBuilder,
                            KafkaTemplate<String, Object> kafkaTemplate,
                            @Value("${app.pricing.mcp-url}") String mcpUrl,
                            @Value("${app.kafka.topics.price-updated}") String priceUpdatedTopic) {
        this.bagRepository = bagRepository;
        this.webClientBuilder = webClientBuilder;
        this.kafkaTemplate = kafkaTemplate;
        this.mcpUrl = mcpUrl;
        this.priceUpdatedTopic = priceUpdatedTopic;
    }

    @Scheduled(cron = "${app.pricing.schedule}")
    public void updateAllBagPrices() {
        List<Bag> activeBags = bagRepository.findByStatus("AVAILABLE");
        log.info("Starting price update for {} active bags", activeBags.size());

        for (Bag bag : activeBags) {
            try {
                // 1. Call MCP tool "pricing_suggest"
                Map<String, Object> request = Map.of(
                        "name", "pricing_suggest",
                        "arguments", Map.of("bag_id", bag.getId())
                );

                DiscountResponse response = webClientBuilder.build()
                        .post()
                        .uri(mcpUrl)
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(DiscountResponse.class)
                        .block(); // block because we're in a scheduled thread

                if (response == null) {
                    log.warn("No response from MCP for bag {}", bag.getId());
                    continue;
                }

                BigDecimal newDiscount = BigDecimal.valueOf(response.getDiscount())
                        .setScale(4, RoundingMode.HALF_UP);

                // 2. Compare and update if changed
                if (bag.getCurrentDiscount() == null ||
                        bag.getCurrentDiscount().compareTo(newDiscount) != 0) {
                    bag.setCurrentDiscount(newDiscount);
                    bagRepository.save(bag);

                    // 3. Emit Kafka event
                    PriceUpdatedEvent event = new PriceUpdatedEvent(bag.getId(), newDiscount);
                    kafkaTemplate.send(priceUpdatedTopic, event);
                    log.info("Updated discount for bag {}: {}", bag.getId(), newDiscount);
                }
            } catch (Exception e) {
                log.error("Failed to update price for bag {}: {}", bag.getId(), e.getMessage());
            }
        }
        log.info("Finished price update cycle");
    }
}