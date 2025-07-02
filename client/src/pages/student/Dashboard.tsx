import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Calendar, ClipboardCheck, DollarSign } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, User, MapPin } from "lucide-react";
import { classApi } from '@/api/classApi';
import { ClassResponse } from '@/types/entityclass';
import { useToast } from '@/components/ui/use-toast';
import teacherApi from '@/api/teacherApi';
import { Teacher } from '@/types/user';
import { getUser } from '@/store/userStore';

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
  const { toast } = useToast();
  const studentId = getUser()?.userId;
  const [classes, setClasses] = useState<ClassResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [teacherMap, setTeacherMap] = useState<Record<string, Teacher>>({});

  useEffect(() => {
    const fetchClassesAndTeachers = async () => {
      if (!studentId) return;
      setLoading(true);
      try {
        const res = await classApi.getAll(undefined, undefined, studentId, undefined, undefined, 0, 100);
        const classList = res.data.result.content;
        setClasses(classList);
        const teacherIds = Array.from(new Set(classList.map(cls => cls.teacherId)));
        const teacherResults = await Promise.all(
          teacherIds.map(id => teacherApi.getById(id).then(r => r.data.result).catch(() => null))
        );
        const map: Record<string, Teacher> = {};
        teacherResults.forEach(teacher => {
          if (teacher) map[teacher.userId] = teacher;
        });
        setTeacherMap(map);
      } catch (error) {
        toast({ title: 'Lỗi', description: 'Không thể tải danh sách lớp học', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchClassesAndTeachers();
  }, [studentId, toast]);

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold mb-2">Xin chào, {getUser()?.fullName || 'học sinh'}</h1>
      <h2 className="text-2xl font-semibold mb-6">Các lớp học của bạn</h2>

      {loading ? (
        <div className="text-center text-lg text-gray-500 py-12">Đang tải...</div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BookOpen className="w-16 h-16 text-blue-200 mb-4" />
          <div className="text-xl font-semibold text-gray-500 mb-2">Bạn chưa có lớp học nào.</div>
          <div className="text-gray-400">Liên hệ trung tâm để được xếp lớp.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.classId} className="transition-shadow hover:shadow-xl border-0 shadow-md bg-white/90">
              <CardHeader className="pb-2 flex flex-row items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-blue-700 leading-tight">{cls.className}</CardTitle>
                  <CardDescription className="text-xs text-gray-400">Mã lớp: {cls.classId}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-blue-400" />
                  <span className="font-medium">GV:</span>
                  <span>{teacherMap[cls.teacherId]?.fullName || cls.teacherId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-green-400" />
                  <span className="font-medium">Phòng:</span>
                  <span>{cls.roomName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} className="text-purple-400" />
                  <span className="font-medium">Lịch:</span>
                  <span>{cls.daysOfWeek?.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-yellow-400" />
                  <span className="font-medium">Giờ:</span>
                  <span>{cls.startTime?.slice(0, 5)} - {cls.endTime?.slice(0, 5)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
