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
        const res = await classApi.getAll(undefined, undefined, studentId, undefined, 0, 100);
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Xin chào, {getUser()?.fullName || 'học sinh'}</h1>
      <h2 className="text-2xl font-semibold">Các lớp học của bạn</h2>

      {loading ? (
        <div>Đang tải...</div>
      ) : classes.length === 0 ? (
        <div>Không có lớp học nào.</div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <Card key={cls.classId} className="flex items-center p-4">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 flex-grow">
                <div>
                  <h3 className="font-semibold">{cls.className}</h3>
                </div>
                <div>
                  <span className="text-sm text-gray-500 flex items-center gap-1"><User size={14} />{teacherMap[cls.teacherId]?.fullName || cls.teacherId}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} />{cls.roomName}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} />{cls.daysOfWeek?.join(', ')} ({cls.startTime?.slice(0, 5)} - {cls.endTime?.slice(0, 5)})</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
