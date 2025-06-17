import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, DollarSign, Bell } from 'lucide-react';
import studentApi from '@/api/studentApi';
import { Student } from '@/types/user';

const AdminDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await studentApi.getAll(0, 10, 'fullName,asc');
      setStudents(res.data.result.content);
      // Log students after setting state
      res.data.result.content.forEach((student) => {
        console.log(student.fullName);
      });
    };
    fetchStudents();
  }, []); // Remove students from dependency array
  // Mock data for dashboard stats
  const stats = [
    { title: 'Tổng số học sinh', value: '215', icon: <Users className="h-5 w-5 text-blue-500" />, change: '+12%', changeDirection: 'up', changeDescription: 'so với tháng trước' },
    { title: 'Tổng số giáo viên', value: '18', icon: <GraduationCap className="h-5 w-5 text-green-500" />, change: '+2', changeDirection: 'up', changeDescription: 'giáo viên mới' },
    { title: 'Tổng thu tháng này', value: '52.500.000đ', icon: <DollarSign className="h-5 w-5 text-yellow-500" />, change: '+8%', changeDirection: 'up', changeDescription: 'so với tháng trước' },
    { title: 'Học phí chưa đóng', value: '15.800.000đ', icon: <Bell className="h-5 w-5 text-red-500" />, change: '32', changeDirection: 'down', changeDescription: 'học sinh cần nhắc' },
  ];

  // Mock data for upcoming classes
  const upcomingClasses = [
    { name: 'Lớp 3.1 - 2024', grade: 3, teacher: 'Nguyễn Thị Hồng', students: 15, time: '15:00 - 16:30', date: 'Hôm nay' },
    { name: 'Lớp 4.2 - 2024', grade: 4, teacher: 'Trần Minh Tuấn', students: 12, time: '17:00 - 18:30', date: 'Hôm nay' },
    { name: 'Lớp 2.1 - 2024', grade: 2, teacher: 'Lê Thị Mai', students: 18, time: '08:30 - 10:00', date: 'Ngày mai' },
    { name: 'Lớp 5.1 - 2024', grade: 5, teacher: 'Phạm Văn Hoàng', students: 14, time: '14:00 - 15:30', date: 'Ngày mai' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.changeDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {stat.change}
                </span>
                {' '}
                {stat.changeDescription}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Lớp học sắp tới</CardTitle>
          <CardDescription>
            Danh sách các lớp học sắp diễn ra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tên lớp</th>
                  <th className="text-left py-3 px-4 font-medium">Khối</th>
                  <th className="text-left py-3 px-4 font-medium">Giáo viên</th>
                  <th className="text-left py-3 px-4 font-medium">Học sinh</th>
                  <th className="text-left py-3 px-4 font-medium">Thời gian</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {upcomingClasses.map((cls, index) => (
                  <tr key={index} className={index !== upcomingClasses.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-4">{cls.name}</td>
                    <td className="py-3 px-4">{cls.grade}</td>
                    <td className="py-3 px-4">{cls.teacher}</td>
                    <td className="py-3 px-4">{cls.students}</td>
                    <td className="py-3 px-4">{cls.time}</td>
                    <td className="py-3 px-4">
                      <span className={cls.date === 'Hôm nay' ? 'text-blue-500 font-medium' : ''}>
                        {cls.date}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            Các hoạt động mới nhất trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <span className="bg-blue-500/20 p-2 rounded-full text-blue-500">
                <Users size={14} />
              </span>
              <div>
                <p className="text-sm font-medium">Phạm Minh Tuấn đã đăng ký lớp 3.1 - 2024</p>
                <p className="text-xs text-gray-500">2 giờ trước</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-green-500/20 p-2 rounded-full text-green-500">
                <DollarSign size={14} />
              </span>
              <div>
                <p className="text-sm font-medium">Đã nhận học phí từ Nguyễn Thị Lan (1.500.000đ)</p>
                <p className="text-xs text-gray-500">4 giờ trước</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-yellow-500/20 p-2 rounded-full text-yellow-500">
                <Bell size={14} />
              </span>
              <div>
                <p className="text-sm font-medium">Đã gửi thông báo nhắc học phí đến 15 phụ huynh</p>
                <p className="text-xs text-gray-500">8 giờ trước</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="bg-red-500/20 p-2 rounded-full text-red-500">
                <GraduationCap size={14} />
              </span>
              <div>
                <p className="text-sm font-medium">Giáo viên Lê Thị Mai đã báo nghỉ lớp 2.1 ngày mai</p>
                <p className="text-xs text-gray-500">Hôm qua</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
