FROM eclipse-temurin:21-jre
WORKDIR /app

ENV TZ=Asia/Ho_Chi_Minh
ENV PORT=8080

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY target/english-center-1.0.0.jar app.jar

# Không cần ENV JAVA_OPTS nữa
# Dùng shell để expand biến đúng
CMD sh -c 'exec java -Dserver.port=$PORT -Dserver.address=0.0.0.0 -jar app.jar'
