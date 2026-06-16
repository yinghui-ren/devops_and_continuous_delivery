# syntax=docker/dockerfile:1
#
# Lab 2 (EASY) — "With a Dockerfile: install an application in an
# Ubuntu container". Two stages:
#   1) builder — compiles Spring PetClinic with Maven
#   2) runtime — a plain Ubuntu image with just a JRE installed,
#      running the jar built in stage 1.

# ---- Stage 1: build the application -------------------------------
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build
RUN git clone --depth 1 https://github.com/spring-projects/spring-petclinic.git .
RUN mvn -q clean package -DskipTests

# ---- Stage 2: runtime image, plain Ubuntu --------------------------
FROM ubuntu:22.04

LABEL maintainer="lab2-devops"
LABEL description="Spring PetClinic running on Ubuntu 22.04 with OpenJDK 21"

# Install just a JRE (not a full JDK) to keep the image smaller.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-21-jre-headless curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /build/target/spring-petclinic-*.jar /app/app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar", "--server.port=8082"]
