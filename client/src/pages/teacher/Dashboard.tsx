
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, ClipboardCheck, Calendar } from 'lucide-react';

const TeacherDashboard = () => {
  // Mock data for teacher stats
  const stats = [
    { title: 'Lớp học đang dạy', value: '4', icon: <GraduationCap className="h-5 w-5 text-blue-500" /> },
    { title: 'Tổng số học sinh', value: '58', icon: <Users className="h-5 w-5 text-green-500" /> },
    { title: 'Buổi dạy tháng này', value: '24', icon: <ClipboardCheck className="h-5 w-5 text-yellow-500" /> },
    { title: 'Buổi dạy tiếp theo', value: 'Hôm nay', time: '15:00', icon: <Calendar className="h-5 w-5 text-red-500" /> },
  ];

  // Mock data for upcoming classes
  const upcomingClasses = [
    { name: 'Lớp 3.1 - 2024', time: '15:00 - 16:30', date: 'Hôm nay', students: 15, location: 'Phòng 101' },
    { name: 'Lớp 4.2 - 2024', time: '17:00 - 18:30', date: 'Hôm nay', students: 12, location: 'Phòng 102' },
    { name: 'Lớp 2.1 - 2024', time: '08:30 - 10:00', date: 'Ngày mai', students: 18, location: 'Phòng 103' },
    { name: 'Lớp 5.1 - 2024', time: '14:00 - 15:30', date: 'Ngày mai', students: 13, location: 'Phòng 104' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">Tổng quan giáo viên</h1>

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
              {stat.time && <p className="text-xs text-blue-500 font-medium">{stat.time}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch dạy sắp tới</CardTitle>
          <CardDescription>
            Danh sách lớp học bạn cần dạy trong thời gian tới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tên lớp</th>
                  <th className="text-left py-3 px-4 font-medium">Thời gian</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày</th>
                  <th className="text-left py-3 px-4 font-medium">Số học sinh</th>
                  <th className="text-left py-3 px-4 font-medium">Địa điểm</th>
                </tr>
              </thead>
              <tbody>
                {upcomingClasses.map((cls, index) => (
                  <tr key={index} className={index !== upcomingClasses.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-4">{cls.name}</td>
                    <td className="py-3 px-4">{cls.time}</td>
                    <td className="py-3 px-4">
                      <span className={cls.date === 'Hôm nay' ? 'text-blue-500 font-medium' : ''}>
                        {cls.date}
                      </span>
                    </td>
                    <td className="py-3 px-4">{cls.students}</td>
                    <td className="py-3 px-4">{cls.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Điểm danh gần đây</CardTitle>
          <CardDescription>
            Thống kê điểm danh các buổi học gần đây
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Lớp 3.1 - Buổi học ngày 15/05/2024</h3>
                <span className="text-xs text-gray-500">15:00 - 16:30</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="text-green-500 font-medium">13/15 </span> 
                học sinh có mặt
              </p>
              <p className="text-xs text-gray-500">
                Vắng: Nguyễn Văn A (ốm), Trần Thị B (việc gia đình)
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Lớp 4.2 - Buổi học ngày 14/05/2024</h3>
                <span className="text-xs text-gray-500">17:00 - 18:30</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <span className="text-green-500 font-medium">12/12 </span> 
                học sinh có mặt
              </p>
              <p className="text-xs text-gray-500">
                Không có học sinh vắng mặt
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
