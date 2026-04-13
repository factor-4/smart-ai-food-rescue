# 🥗 Smart Food Rescue


**A real‑time food waste reduction platform connecting surplus restaurant food with nearby consumers.**

> 🚧 **This project is actively under construction.**  
> The final system will be a cloud‑native microservices platform deployed on **Microsoft Azure** (AKS, PostgreSQL, Azure OpenAI, and more).

---

##  What It Will Do

- 🍽️ Restaurants can list surplus food bags at discounted prices in real time.
- 🗺️ Users see nearby available bags on an interactive map (Leaflet).
- ⚡ Live inventory updates via WebSockets – no more refreshing.
- 🤖 AI‑powered personalized recommendations using **Azure OpenAI** and vector search.
- 💳 Complete order flow with saga‑based consistency (Kafka).
- 📊 Full observability with Grafana, Prometheus, and **Azure Monitor**.

---

##  Planned Tech Stack (Azure‑First)

- **Frontend:** React + TypeScript + Vite + Tailwind + Zustand
- **Backend:** Spring Boot microservices (Java 21), API Gateway, Kafka, Redis
- **AI:** Python FastAPI + LangChain + pgvector + Azure OpenAI
- **Infrastructure:** Terraform – Azure Kubernetes Service, PostgreSQL Flexible Server, Cache for Redis, Blob Storage, Key Vault
- **CI/CD:** GitHub Actions + Trivy + OIDC to Azure

.

