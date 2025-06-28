import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, DollarSign, Bell } from 'lucide-react';
import studentApi from '@/api/studentApi';
import teacherApi from '@/api/teacherApi';
import paymentApi from '@/api/paymentApi';
import tuitionFeeApi from '@/api/tuitionFeeApi';
import { classApi } from '@/api/classApi';
import { useToast } from '@/components/ui/use-toast';
import { format, isThisMonth, parseISO } from 'date-fns';
import { Student } from '@/types/user';
import { userApi } from '@/api/userApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Tổng số học sinh', value: '...', icon: <Users className="h-5 w-5 text-blue-500" />, change: '', changeDirection: 'up', changeDescription: '' },
    { title: 'Tổng số giáo viên', value: '...', icon: <GraduationCap className="h-5 w-5 text-green-500" />, change: '', changeDirection: 'up', changeDescription: '' },
    { title: 'Tổng thu tháng này', value: '...', icon: <DollarSign className="h-5 w-5 text-yellow-500" />, change: '', changeDirection: 'up', changeDescription: '' },
    { title: 'Học phí chưa đóng', value: '...', icon: <Bell className="h-5 w-5 text-red-500" />, change: '', changeDirection: 'down', changeDescription: '' },
  ]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const { toast } = useToast();
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Tổng số học sinh
        const stuRes = await studentApi.getAll(undefined, undefined, 0, 1);
        let totalStudents = 0;
        if (stuRes.data?.result?.page?.totalElements !== undefined) {
          totalStudents = stuRes.data.result.page.totalElements;
        } else if (Array.isArray(stuRes.data?.result)) {
          totalStudents = stuRes.data.result.length;
        }

        // Tổng số giáo viên
        const teaRes = await teacherApi.getAll(undefined, undefined, 0, 1);
        let totalTeachers = 0;
        if (teaRes.data?.result?.page?.totalElements !== undefined) {
          totalTeachers = teaRes.data.result.page.totalElements;
        } else if (Array.isArray(teaRes.data?.result)) {
          totalTeachers = teaRes.data.result.length;
        }

        // Tổng thu tháng này
        const payRes = await paymentApi.getAll(undefined, undefined, 0, 1000);
        let payments = [];
        if (Array.isArray(payRes.data?.result)) {
          payments = payRes.data.result;
        } else if (payRes.data?.result?.content) {
          payments = payRes.data.result.content;
        }
        const totalPaid = payments
          .filter((p) => p.tuitionFee && isThisMonth(parseISO(p.tuitionFee.yearMonth + '-01')))
          .reduce((sum, p) => sum + (p.paidAmount || 0), 0);

        // Học phí chưa đóng
        const feeRes = await tuitionFeeApi.getAll(undefined, undefined, 0, 1000);
        let fees = [];
        if (Array.isArray(feeRes.data?.result)) {
          fees = feeRes.data.result;
        } else if (feeRes.data?.result?.content) {
          fees = feeRes.data.result.content;
        }
        const totalUnpaid = fees
          .filter((f) => f.remainingAmount > 0)
          .reduce((sum, f) => sum + (f.remainingAmount || 0), 0);

        setStats([
          { title: 'Tổng số học sinh', value: totalStudents.toString(), icon: <Users className="h-5 w-5 text-blue-500" />, change: '', changeDirection: 'up', changeDescription: '' },
          { title: 'Tổng số giáo viên', value: totalTeachers.toString(), icon: <GraduationCap className="h-5 w-5 text-green-500" />, change: '', changeDirection: 'up', changeDescription: '' },
          { title: 'Tổng thu tháng này', value: totalPaid.toLocaleString('vi-VN') + 'đ', icon: <DollarSign className="h-5 w-5 text-yellow-500" />, change: '', changeDirection: 'up', changeDescription: '' },
          { title: 'Học phí chưa đóng', value: totalUnpaid.toLocaleString('vi-VN') + 'đ', icon: <Bell className="h-5 w-5 text-red-500" />, change: '', changeDirection: 'down', changeDescription: '' },
        ]);
      } catch (e) {
        console.error('Lỗi fetchStats:', e);
        toast({ title: 'Lỗi', description: 'Không thể tải thống kê.' });
      }
    };
    const fetchUpcoming = async () => {
      try {
        const res = await classApi.getAll("upcoming", undefined, undefined, undefined, 0, 5, 'startDate,ASC');
        const arr = res.data.result.content || [];
        // Lấy danh sách teacherId duy nhất
        const teacherIds = Array.from(new Set(arr.map((cls: any) => cls.teacherId).filter(Boolean)));
        // Gọi userApi để lấy tên giáo viên
        let teacherMap: Record<string, string> = {};
        if (teacherIds.length > 0) {
          const teacherReqs = await Promise.all(teacherIds.map(id => userApi.getById(id)));
          teacherReqs.forEach((res, idx) => {
            teacherMap[teacherIds[idx]] = res.data.result.fullName || res.data.result.username || teacherIds[idx];
          });
        }
        setTeacherMap(teacherMap);
        setUpcomingClasses(arr.map((cls: any) => ({
          name: cls.className,
          grade: cls.grade,
          teacher: teacherMap[cls.teacherId] || cls.teacherId,
          students: cls.studentIds?.length || 0,
          time: (cls.startTime || '') + (cls.endTime ? ' - ' + cls.endTime : ''),
          date: format(new Date(cls.startDate), 'dd/MM/yyyy'),
        })));
      } catch {
        setUpcomingClasses([]);
      }
    };
    fetchStats();
    fetchUpcoming();
  }, [toast]);

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
