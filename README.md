# E-Commerce Microservices Platform

A scalable and production-style E-Commerce Microservices application built using Java, Spring Boot, and Spring Cloud. The project follows real-world microservices architecture with independent services for users, products, orders, payments, and API Gateway.

The application is containerized using Docker, deployed with Kubernetes, and automated through Jenkins CI/CD pipelines. It also includes service discovery, centralized configuration, REST API communication, and monitoring tools for better scalability and reliability.

## Tech Stack

- Java
- Spring Boot
- Spring Cloud
- MySQL
- Docker
- Kubernetes
- Jenkins
- Maven
- Git

## Features

- Microservices Architecture
- API Gateway
- Service Discovery (Eureka)
- REST APIs
- Docker Containerization
- Kubernetes Deployment
- CI/CD Pipeline
- Centralized Configuration
- Monitoring & Logging

## Project Structure

```bash
ecommerce-microservices/
├── api-gateway/
├── user-service/
├── product-service/
├── order-service/
├── payment-service/
├── discovery-server/
├── config-server/
└── docker-compose.yml
