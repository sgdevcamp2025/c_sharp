# JDK 17 기반 이미지 사용
FROM eclipse-temurin:17-jdk-jammy

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
ARG JAR_FILE=build/libs/chat-service-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]

