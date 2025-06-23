# Runtime base image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Thiết lập timezone
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy file JAR đã build sẵn
COPY target/english-center-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Command chạy ứng dụng
CMD ["java", "-jar", "app.jar"]
