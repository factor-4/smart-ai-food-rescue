# ─────────────────────────────────────────
# STAGE 1 — BUILD
# ─────────────────────────────────────────

# We use a full JDK image to compile and package the app.
# This image is ONLY used for building — it never goes to production.
# "AS builder" gives this stage a name so we can reference it later.
FROM eclipse-temurin:21-jdk-alpine AS builder

# Set working directory inside the container
WORKDIR /app


# dependency download layer. This makes rebuilds much faster.
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the fat JAR.
# -DskipTests — we run tests separately in CI, not during Docker build.
RUN ./mvnw clean package -DskipTests

# ─────────────────────────────────────────
# STAGE 2 — RUNTIME
# ─────────────────────────────────────────

# We use a SMALLER image for running — JRE not JDK.
# JDK = compiler + runtime (needed to BUILD)
# JRE = runtime only (needed to RUN)
# Smaller image = smaller attack surface + faster deploys.
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy ONLY the JAR from the build stage.
# This is why multi-stage builds are secure.
COPY --from=builder /app/target/*.jar app.jar

# Document which port this service listens on.
# This doesn't actually expose the port — docker-compose does that.
# It's documentation for other developers.
EXPOSE 8082

# Run the app.
# Using array form (exec form) — not shell form.
# Exec form: process receives signals directly (graceful shutdown works).
# Shell form: signals go to shell, not the app (graceful shutdown broken).
ENTRYPOINT ["java", "-jar", "app.jar"]