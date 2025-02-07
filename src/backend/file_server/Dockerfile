# Azul Zulu JDK 17 기반 이미지 사용
FROM azul/zulu-openjdk:17

# 작업 디렉토리 설정
WORKDIR /app

# 환경 변수 파일 복사
COPY .env .env

# 빌드된 JAR 파일 복사
ARG JAR_FILE=build/libs/file_server-0.0.1-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar

# 환경 변수 설정
ENV $(cat .env)

# 포트 노출
EXPOSE 8083

# 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]