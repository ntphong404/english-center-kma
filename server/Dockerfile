# Multi-stage build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Install dos2unix to handle line ending issues
RUN apt-get update && apt-get install -y dos2unix && rm -rf /var/lib/apt/lists/*

# Copy source code and Maven wrapper
COPY . .

# Fix line endings and make mvnw executable
RUN dos2unix mvnw && chmod +x mvnw

# Build the application with optimizations
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/english-center-1.0.0.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]