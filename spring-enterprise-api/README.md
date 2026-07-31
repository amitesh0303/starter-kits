# Spring Enterprise API

Enterprise subscriptions API built with Spring Boot, Spring Security JWT, PostgreSQL/JPA, Redis, and Stripe.

## Features

- Spring Security with JWT authentication
- User registration and login
- JPA with PostgreSQL (H2 for testing)
- Redis caching
- Stripe subscription billing
- Maven build with wrapper

## Quick Start

```bash
# Build the project
./mvnw clean package

# Run the application
./mvnw spring-boot:run

# Run tests
./mvnw test
```

## Project Structure

```
src/main/java/com/example/enterprise/
  controller/   - REST endpoints (Health, Auth)
  service/      - Business logic (AuthService)
  model/        - JPA entities (User)
  repository/   - Spring Data repositories
  config/       - Security and JWT configuration
src/test/java/  - Integration tests
```

## Environment Variables

See `.env.example` for all required configuration values.
