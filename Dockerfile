# Build stage
FROM gradle:8.4-jdk17-alpine AS build
WORKDIR /home/gradle/project
COPY . .
# 백엔드 폴더로 이동하여 빌드
RUN cd backend && gradle clean bootJar -x test

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /home/gradle/project/backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
