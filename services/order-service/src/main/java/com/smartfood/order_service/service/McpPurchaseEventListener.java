package com.smartfood.order_service.service;

import com.smartfood.order_service.event.OrderConfirmedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class McpPurchaseEventListener {

    private final WebClient mcpWebClient;  // from your McpClientConfig

    @EventListener
    public void handleOrderConfirmed(OrderConfirmedEvent event) {
        try {
            Map<String, Object> arguments = Map.of(
                    "user_id", event.getUserId(),
                    "bag_id", event.getBagId(),
                    "order_id", event.getOrderId(),
                    "price_paid", event.getTotalPrice()
            );
            Map<String, Object> body = Map.of("name", "record_purchase", "arguments", arguments);

            mcpWebClient.post()
                    .uri("/mcp/tools/call")
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity()
                    .doOnSuccess(resp -> log.info("Purchase recorded via MCP for order {}", event.getOrderId()))
                    .doOnError(err -> log.error("MCP call failed for order {}: {}", event.getOrderId(), err.getMessage()))
                    .subscribe();
        } catch (Exception e) {
            log.error("Unexpected error in MCP listener for order {}: {}", event.getOrderId(), e.getMessage());
        }
    }
}