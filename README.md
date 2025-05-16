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

- Node.js (v18 trở lên)
- MongoDB (v6 trở lên)
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
npm install
```

#### Frontend (Client)
```bash
cd client
npm install
```

### 3. Cấu Hình Môi Trường

#### Backend
Tạo file `.env` trong thư mục `server`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/english-center
JWT_SECRET=your_jwt_secret
```

#### Frontend
Tạo file `.env` trong thư mục `client`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Chạy Ứng Dụng

#### Backend
```bash
cd server
npm run dev
```

#### Frontend
```bash
cd client
npm run dev
```

Ứng dụng sẽ chạy tại:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

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
└── server/                # Backend (Node.js + Express)
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── models/       # Database models
    │   ├── routes/       # API routes
    │   ├── schemas/      # Validation schemas
    │   └── utils/        # Utility functions
    └── uploads/          # Uploaded files
```

## API Documentation

API documentation có thể được truy cập tại: http://localhost:5000/api-docs

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

## Đóng Góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request để đóng góp.

## Giấy Phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Liên Hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ:
- Email: your-email@example.com
- Website: https://your-website.com 