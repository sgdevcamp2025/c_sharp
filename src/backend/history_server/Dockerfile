FROM --platform=linux/amd64 azul/zulu-openjdk:17
ARG JAR_FILE=build/libs/history_server.jar
COPY ${JAR_FILE} ./history_server.jar
ENV TZ=Asia/Seoul
ENTRYPOINT ["java", "-jar", "./history_server.jar"]