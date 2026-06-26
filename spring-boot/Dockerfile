FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY spring-boot/pom.xml .
RUN mvn -B dependency:go-offline

COPY spring-boot/src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre-jammy

RUN groupadd --system --gid 10001 mfm \
    && useradd --system --uid 10001 --gid mfm --home-dir /nonexistent --shell /usr/sbin/nologin mfm \
    && mkdir -p /app /data \
    && chown -R mfm:mfm /app /data

WORKDIR /app
COPY --from=build --chown=mfm:mfm /workspace/target/*.jar /app/mfm.jar

USER 10001:10001

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -Djava.io.tmpdir=/tmp"
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/mfm.jar"]
