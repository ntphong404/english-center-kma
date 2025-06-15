# English Center - Hệ Thống Quản Lý Trung Tâm Anh Ngữ

## Giới Thiệu

English Center là hệ thống quản lý trung tâm Anh ngữ toàn diện, được phát triển để hỗ trợ việc quản lý và vận hành trung tâm Anh ngữ một cách hiệu quả. Hệ thống bao gồm các tính năng dành cho Admin, Giáo viên, Học viên và Phụ huynh.

### Tính Năng Chính

#### Admin
- Quản lý giáo viên, học viên và phụ huynh
- Quản lý lớp học và lịch giảng dạy
- Quản lý học phí và báo cáo tài chính
- Gửi thông báo và quản lý hệ thống

#### Giáo Viên
- Xem danh sách lớp học
- Quản lý điểm danh và đánh giá học viên
- Xem lịch giảng dạy
- Tải lên tài liệu và bài tập

#### Học Viên
- Xem lịch học và thời khóa biểu
- Theo dõi tiến độ học tập
- Xem điểm danh và đánh giá
- Tải tài liệu và bài tập

#### Phụ Huynh
- Theo dõi tiến độ học tập của con
- Xem lịch học và thời khóa biểu
- Quản lý học phí
- Nhận thông báo từ trung tâm

## Yêu Cầu Hệ Thống

### Backend
- Java 21
- Spring Boot 3.x
- Maven 
- MySQL 8.0 trở lên

### Frontend
- Node.js (v18 trở lên)
- npm hoặc yarn

## Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/your-username/english-center.git
cd english-center
```

### 2. Cài Đặt Dependencies

#### Backend (Server)
```bash
cd server
# Nếu sử dụng Maven
mvn clean install

# Hoặc nếu sử dụng Gradle
./gradlew build
```

#### Frontend (Client)
```bash
cd client
npm install

# Hoặc 
yarn


```

### 3. Cấu Hình Môi Trường

#### Backend
Tạo file `application.properties` hoặc `application.yml` trong thư mục `server/src/main/resources`:
```properties
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: ...
    username: ...
    password: ...
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  main:
    banner-mode: off

logging:
  level:
    root: warn

jwt:
  signerKey: "..."
  valid-duration: 3600 # in second
  refreshable-duration: 36000 # in seconds

cloudinary:
  cloud-name: ...
  api-key: ...
  api-secret: ...
```

#### Frontend
Tạo file `.env` trong thư mục `client`:
```env
VITE_API_URL=http://localhost:8080/api
```

### 4. Chạy Ứng Dụng

#### Backend
```bash
cd server
# Nếu sử dụng Maven
mvn spring-boot:run

# Hoặc nếu sử dụng Gradle
./gradlew bootRun
```

#### Frontend
```bash
cd client
npm run dev

# Hoặc
yarn dev
```

Ứng dụng sẽ chạy tại:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## Cấu Trúc Dự Án

```
english-center/
├── client/                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # Shared components
│   │   ├── pages/        # Page components
│   │   ├── layouts/      # Layout components
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
│
└── server/                # Backend (Spring Boot)
    ├── src/
    │   ├── main/
    │   │   ├── java/
    │   │   │   ├── controller/  # REST controllers
    │   │   │   ├── model/       # Entity classes
    │   │   │   ├── repository/ # JPA repositories
    │   │   │   ├── service/     # Business logic
    │   │   │   ├── dto/          # Data transfer objects
    │   │   │   ├── config/       # Configuration classes
    │   │   │   └── utils/        # Utility classes
    │   │   └── resources/        # Application properties
    │   └── test/                 # Test classes
    └── uploads (Cloudinary)/                  # Uploaded files
```

## API Documentation

API documentation có thể được truy cập tại: http://localhost:8080/swagger-ui.html

## Tài Khoản Mặc Định

### Admin
- Username: admin
- Password: admin123

### Giáo Viên
- Username: teacher
- Password: teacher123

### Học Viên
- Username: student
- Password: student123

### Phụ Huynh
- Username: parent
- Password: parent123

## Công Nghệ Sử Dụng

### Backend
- Java 21
- Spring Boot 3.x
- Spring Security
- Spring Data JPA
- MySQL
- JWT Authentication
- Maven/Gradle
- Swagger/OpenAPI

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query

## Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy Phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Liên Hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ:
- Email: your-email@example.com
- Website: https://your-website.com 