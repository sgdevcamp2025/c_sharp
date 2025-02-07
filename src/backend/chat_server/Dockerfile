FROM --platform=linux/amd64 azul/zulu-openjdk:17
ARG JAR_FILE=build/libs/chat_server1.jar
COPY ${JAR_FILE} ./chat_server1.jar
ENV TZ=Asia/Seoul
ENTRYPOINT ["java", "-jar", "./chat_server1.jar"]

