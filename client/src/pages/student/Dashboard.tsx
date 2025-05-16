import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, ClipboardCheck, DollarSign } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award } from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

interface UpcomingClass {
  id: string;
  name: string;
  teacher: string;
  time: string;
  room: string;
}

const StudentDashboard = () => {
  // Mock student data
  const student = {
    name: 'Nguyễn Văn An',
    class: 'Lớp 3.1 - 2024',
    teacher: 'Nguyễn Thị Hồng',
    totalClasses: 48,
    attendedClasses: 42,
    absentClasses: 6,
    nextClass: 'Thứ 3, 15:00 - 16:30',
    nextClassDate: '21/05/2024',
    fees: {
      total: '3.600.000đ',
      paid: '2.400.000đ',
      remaining: '1.200.000đ',
      dueDate: '30/05/2024',
      discount: '0%'
    }
  };

  // Mock attendance data
  const recentAttendance = [
    { date: '14/05/2024', status: 'present', note: '' },
    { date: '12/05/2024', status: 'present', note: '' },
    { date: '07/05/2024', status: 'absent', note: 'Nghỉ ốm (có phép)' },
    { date: '05/05/2024', status: 'present', note: '' },
    { date: '30/04/2024', status: 'present', note: '' },
  ];

  const statCards: StatCard[] = [
    {
      title: "Lớp học hiện tại",
      value: "3",
      description: "Số lớp đang học",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: "Giờ học",
      value: "45",
      description: "Tổng số giờ đã học",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: "Điểm số",
      value: "8.5",
      description: "Điểm trung bình",
      icon: <Award className="h-4 w-4" />,
    },
  ];

  const upcomingClasses: UpcomingClass[] = [
    {
      id: "1",
      name: "Lớp A1",
      teacher: "Nguyễn Văn A",
      time: "08:00 - 09:30",
      room: "Phòng 101",
    },
    {
      id: "2",
      name: "Lớp B2",
      teacher: "Trần Thị B",
      time: "13:30 - 15:00",
      room: "Phòng 102",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">Xin chào, {student.name}</h1>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin học sinh</CardTitle>
          <CardDescription>Chi tiết thông tin cá nhân và lớp học</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Lớp học</dt>
              <dd className="text-lg font-semibold">{student.class}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Giáo viên</dt>
              <dd className="text-lg font-semibold">{student.teacher}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Buổi học tiếp theo</dt>
              <dd className="text-lg font-semibold">{student.nextClass}</dd>
              <dd className="text-sm text-blue-500">{student.nextClassDate}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số buổi học</CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Số buổi đã học</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.attendedClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Số buổi vắng</CardTitle>
            <Calendar className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.absentClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Học phí còn nợ</CardTitle>
            <DollarSign className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.fees.remaining}</div>
            <p className="text-xs text-gray-500">Hạn nộp: {student.fees.dueDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử điểm danh</CardTitle>
          <CardDescription>
            5 buổi học gần nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Ngày</th>
                  <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record, index) => (
                  <tr key={index} className={index !== recentAttendance.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {record.status === 'present' ? 'Có mặt' : 'Vắng mặt'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{record.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin học phí</CardTitle>
          <CardDescription>
            Chi tiết về học phí và thanh toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Tổng học phí</dt>
              <dd className="text-lg font-semibold">{student.fees.total}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Đã đóng</dt>
              <dd className="text-lg font-semibold text-green-600">{student.fees.paid}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Còn lại</dt>
              <dd className="text-lg font-semibold text-red-600">{student.fees.remaining}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Giảm giá</dt>
              <dd className="text-lg font-semibold">{student.fees.discount}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tổng quan</h2>
        <Button>
          <Calendar className="mr-2 h-4 w-4" /> Xem lịch học
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ học tập</CardTitle>
            <CardDescription>
              Theo dõi tiến độ học tập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ngữ pháp</span>
                  <span>75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Từ vựng</span>
                  <span>60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Phát âm</span>
                  <span>85%</span>
                </div>
                <Progress value={85} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lớp học sắp tới</CardTitle>
            <CardDescription>
              Danh sách các lớp học sắp diễn ra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{cls.name}</h3>
                    <p className="text-sm text-gray-500">
                      Giáo viên: {cls.teacher}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{cls.time}</p>
                    <p className="text-sm text-gray-500">{cls.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
