import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, ClipboardCheck, Calendar } from 'lucide-react';
import { classApi } from '@/api/classApi';
import { getUser } from '@/store/userStore';
import { ClassResponse } from '@/types/entityclass';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      const user = getUser();
      if (user) {
        try {
          const res = await classApi.getAll(undefined, user.userId, undefined, undefined, 0, 100);
          let result = res.data.result;
          let newClasses: ClassResponse[] = [];
          if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
            newClasses = result.content;
          } else if (Array.isArray(result)) {
            newClasses = result;
          }
          setClasses(newClasses);
        } catch {
          toast({ title: 'Lỗi', description: 'Không thể tải danh sách lớp.' });
        }
      }
      setLoading(false);
    };
    fetchClasses();
  }, []);

  // Tổng số học sinh
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentIds?.length || 0), 0);

  // Lịch dạy sắp tới: lấy các lớp có ngày bắt đầu >= hôm nay, sắp xếp theo ngày bắt đầu
  const today = new Date();
  const upcomingClasses = classes
    .filter(cls => new Date(cls.startDate) >= today)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-8">Tổng quan giáo viên</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lớp học đang dạy</CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số học sinh</CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        {/* Có thể thêm các thống kê khác nếu muốn */}
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
                  <th className="text-left py-3 px-4 font-medium">Ngày bắt đầu</th>
                  <th className="text-left py-3 px-4 font-medium">Sĩ số</th>
                  <th className="text-left py-3 px-4 font-medium">Phòng</th>
                </tr>
              </thead>
              <tbody>
                {upcomingClasses.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-4">Không có lớp sắp tới.</td></tr>
                )}
                {upcomingClasses.map((cls, index) => (
                  <tr key={cls.classId} className={index !== upcomingClasses.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-4">{cls.className}</td>
                    <td className="py-3 px-4">{cls.startTime} - {cls.endTime}</td>
                    <td className="py-3 px-4">{format(new Date(cls.startDate), 'dd/MM/yyyy', { locale: vi })}</td>
                    <td className="py-3 px-4">{cls.studentIds.length}</td>
                    <td className="py-3 px-4">{cls.roomName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance - placeholder, cần API thực tế để lấy điểm danh gần đây */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Điểm danh gần đây</CardTitle>
          <CardDescription>
            Thống kê điểm danh các buổi học gần đây
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            ...
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
