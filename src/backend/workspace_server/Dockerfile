# Azul Zulu OpenJDK 17 기반 이미지
FROM azul/zulu-openjdk:17

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일 복사
ARG JAR_FILE=build/libs/workspace-server-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
