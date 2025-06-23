import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { classApi } from '@/api/classApi';
import teacherApi from '@/api/teacherApi';
import { getUser } from '@/store/userStore';
import { ClassResponse } from '@/types/entityclass';
import { Teacher } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';

interface Schedule {
    id: string;
    className: string;
    teacher: string;
    room: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    level: string;
}

const daysOfWeek = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
];

const dayMap: Record<string, string> = {
    'MONDAY': 'Thứ 2',
    'TUESDAY': 'Thứ 3',
    'WEDNESDAY': 'Thứ 4',
    'THURSDAY': 'Thứ 5',
    'FRIDAY': 'Thứ 6',
    'SATURDAY': 'Thứ 7',
    'SUNDAY': 'Chủ nhật'
};

function getDayOfWeekVN(date: Date) {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
}

export default function StudentSchedule() {
    const [selectedDay, setSelectedDay] = useState<string>("Thứ 2");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [teacherMap, setTeacherMap] = useState<Record<string, Teacher>>({});
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const studentId = getUser()?.userId;

    useEffect(() => {
        const fetchClassesAndTeachers = async () => {
            if (!studentId) return;
            setLoading(true);
            try {
                const res = await classApi.getAll(undefined, undefined, studentId, undefined, 0, 100);
                const classList = res.data.result.content;
                setClasses(classList);

                // Lấy thông tin giáo viên
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
                toast({ title: 'Lỗi', description: 'Không thể tải lịch học', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchClassesAndTeachers();
    }, [studentId, toast]);

    // Lọc theo thứ
    const filteredSchedules = classes.filter(cls =>
        cls.daysOfWeek?.some(day => dayMap[day] === selectedDay)
    );

    // Lọc theo ngày
    const filteredByDate = classes.filter(cls =>
        cls.daysOfWeek?.some(day => dayMap[day] === getDayOfWeekVN(selectedDate))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lịch học</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo thứ</CardTitle>
                        <CardDescription>
                            Xem lịch học theo từng ngày trong tuần
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2 flex-wrap">
                                {daysOfWeek.map((day) => (
                                    <Button
                                        key={day}
                                        variant={selectedDay === day ? "default" : "outline"}
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div>Đang tải...</div>
                                ) : filteredSchedules.length === 0 ? (
                                    <div>Không có lớp nào vào {selectedDay}.</div>
                                ) : (
                                    filteredSchedules.map((cls) => (
                                        <div
                                            key={cls.classId}
                                            className="p-4 border rounded-lg space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold">{cls.className}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        Giáo viên: {teacherMap[cls.teacherId]?.fullName || cls.teacherId}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Trình độ: Khối {cls.grade}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {cls.startTime} - {cls.endTime}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{cls.roomName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo ngày</CardTitle>
                        <CardDescription>
                            Chọn ngày để xem lịch học
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            locale={vi}
                            className="rounded-md border"
                        />
                        <div className="mt-4 p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">
                                Lịch học ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
                            </h3>
                            <div className="space-y-2">
                                {loading ? (
                                    <div>Đang tải...</div>
                                ) : filteredByDate.length === 0 ? (
                                    <div>Không có lớp nào vào ngày này.</div>
                                ) : (
                                    filteredByDate.map((cls) => (
                                        <div
                                            key={cls.classId}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <span>{cls.className}</span>
                                            <span>
                                                {cls.startTime} - {cls.endTime}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 