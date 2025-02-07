FROM --platform=linux/amd64 openjdk:17
ARG JAR_FILE=build/libs/stock_server.jar
COPY ${JAR_FILE} ./stock_server.jar
ENV TZ=Asia/Seoul
ENTRYPOINT ["java", "-jar", "./stock_server.jar"]