# Build stage
FROM gradle:8.4-jdk17-alpine AS build
WORKDIR /app

# 의존성만 먼저 복사 → 소스 변경 시 이 레이어는 캐시 재사용
COPY backend/build.gradle backend/settings.gradle ./
COPY backend/gradle ./gradle
RUN gradle dependencies --no-daemon 2>/dev/null || true

# 소스 복사 후 빌드 (clean 제거 → 증분 빌드)
COPY backend/src ./src
RUN gradle bootJar -x test --no-daemon

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
