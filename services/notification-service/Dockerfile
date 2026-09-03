# ---------- Stage 1: Build ----------
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Install Maven (because the JDK image doesn't have it)
RUN apk add --no-cache maven

# Copy only the pom.xml first to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Now copy the source and build
COPY src ./src
RUN mvn clean package -DskipTests

# ---------- Stage 2: Run ----------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# The port  service listens on
EXPOSE 8084

# Command to start the service
ENTRYPOINT ["java", "-jar", "app.jar"]