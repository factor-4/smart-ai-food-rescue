# Smart Food Rescue

A platform for restaurants to list surplus food bags at discounted prices, and for customers to find and purchase them nearby. Built as a microservices system with a multi-agent AI layer.

**Demo video:** https://youtu.be/P6abRVoq7yk

## What it does

- Restaurant owners create listings for surplus food bags with pickup times and dynamic pricing.
- Customers browse available bags, see them on a map, and receive AI-generated recommendations.
- Orders are processed asynchronously through Kafka with a Saga orchestrator handling inventory reservation and Stripe payment.
- Real-time updates for bag stock and order status via WebSocket and Redis pub/sub.
- The AI layer uses a Planner agent, a RAG agent for vector search, and a Pricing agent, all exposed through an MCP server.

## Stack

- Frontend: React, TypeScript, Vite, Tailwind
- Backend: Java 21, Spring Boot, Spring Cloud Gateway, Eureka, Kafka, Redis
- AI: Python FastAPI, LangChain, pgvector, Ollama (local LLM)
- Database: PostgreSQL with Flyway migrations
- Infrastructure: Docker, Kubernetes (kind), Nginx Ingress
- Payments: Stripe

## Running locally

1. Start Docker Desktop.
2. Create the kind cluster:
   `kind create cluster --config kind-config.yaml`
3. Apply the Kubernetes manifests:
   `kubectl apply -f k8s/`
4. Start Ollama with the Llama 3.2 model:
   `ollama run llama3.2:1b`
5. Port-forward the API Gateway:
   `kubectl port-forward -n smartfood svc/api-gateway 8080:8080`
6. Open `http://smartfood.local` in a browser.

The demo video above shows the full flow: customer login, AI recommendations loading, a Stripe test payment, the order status updating in the background, and the owner dashboard with sales charts.