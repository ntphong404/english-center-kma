import { useState, useRef, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, isSameMonth } from "date-fns";
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
    start: string;
    end: string;
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

function getMonthMatrix(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix = [];
    let week = [];
    let day = new Date(firstDay);
    let startDay = day.getDay() === 0 ? 7 : day.getDay();
    if (startDay > 1) {
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
        for (let i = startDay - 2; i >= 0; i--) {
            week.push(new Date(prevYear, prevMonth, prevLastDay - i));
        }
    }
    while (day <= lastDay) {
        week.push(new Date(day));
        if (week.length === 7) {
            matrix.push(week);
            week = [];
        }
        day.setDate(day.getDate() + 1);
    }
    if (week.length) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        for (let i = 1; week.length < 7; i++) {
            week.push(new Date(nextYear, nextMonth, i));
        }
        matrix.push(week);
    }
    // Chỉ thêm dòng thứ 6 nếu ngày cuối tháng rơi vào CN hoặc matrix.length < 6 và tuần cuối chưa đủ 7 ngày
    if (matrix.length < 6) {
        const lastDate = lastDay.getDate();
        const lastDayOfWeek = lastDay.getDay();
        if (lastDayOfWeek !== 0) {
            if (matrix.length < 5) {
                const lastRow = matrix[matrix.length - 1];
                const nextMonth = month === 11 ? 0 : month + 1;
                const nextYear = month === 11 ? year + 1 : year;
                let startDay = lastRow[lastRow.length - 1].getDate() + 1;
                for (let r = matrix.length; r < 5; r++) {
                    let week = [];
                    for (let i = 0; i < 7; i++) {
                        week.push(new Date(nextYear, nextMonth, startDay++));
                    }
                    matrix.push(week);
                }
            }
        } else {
            const lastRow = matrix[matrix.length - 1];
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            let startDay = lastRow[lastRow.length - 1].getDate() + 1;
            let week = [];
            for (let i = 0; i < 7; i++) {
                week.push(new Date(nextYear, nextMonth, startDay++));
            }
            matrix.push(week);
        }
    }
    return matrix;
}

function convertDayOfWeekToNumber(dow: string) {
    switch (dow) {
        case 'SUNDAY': return 0;
        case 'MONDAY': return 1;
        case 'TUESDAY': return 2;
        case 'WEDNESDAY': return 3;
        case 'THURSDAY': return 4;
        case 'FRIDAY': return 5;
        case 'SATURDAY': return 6;
        default: return 1;
    }
}

export default function StudentSchedule() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [teacherMap, setTeacherMap] = useState<Record<string, Teacher>>({});
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const studentId = getUser()?.userId;
    const [calendarHeight, setCalendarHeight] = useState<number | null>(null);

    useEffect(() => {
        const fetchClassesAndTeachers = async () => {
            if (!studentId) return;
            setLoading(true);
            try {
                const res = await classApi.getAll(undefined, undefined, studentId, undefined, "OPEN", 0, 100);
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

    // Tạo lịch học từ danh sách lớp
    useEffect(() => {
        let allSchedules: Schedule[] = [];
        classes.forEach((cls: ClassResponse) => {
            const classStart = new Date(cls.startDate);
            const classEnd = new Date(cls.endDate);
            cls.daysOfWeek.forEach((dow: string) => {
                for (let d = 1; d <= 31; d++) {
                    const date = new Date(year, month, d);
                    if (date.getMonth() !== month) continue;
                    if (date < classStart || date > classEnd) continue;
                    if (date.getDay() === convertDayOfWeekToNumber(dow)) {
                        allSchedules.push({
                            id: cls.classId + '-' + d + '-' + dow + '-' + cls.startTime,
                            className: cls.className,
                            teacher: teacherMap[cls.teacherId]?.fullName || cls.teacherId,
                            room: cls.roomName,
                            start: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${cls.startTime}`,
                            end: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${cls.endTime}`,
                            level: `Khối ${cls.grade}`
                        });
                    }
                }
            });
        });
        setSchedules(allSchedules);
    }, [classes, teacherMap, month, year]);

    // Lọc lịch học theo ngày được chọn
    const daySchedules = schedules.filter(s =>
        isSameDay(new Date(s.start), selectedDate)
    ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Lấy tất cả ngày trong tháng có lịch học
    const daysWithSchedules = schedules
        .map(s => new Date(s.start))
        .filter(d => d.getMonth() === month && d.getFullYear() === year)
        .map(d => d.getDate());

    // Ma trận lịch
    const matrix = getMonthMatrix(year, month);

    useEffect(() => {
        if (calendarRef.current) {
            const height = calendarRef.current.getBoundingClientRect().height;
            setCalendarHeight(height);
        }
    }, []);

    return (
        <div className="w-full bg-[#f5f6fa]">
            <div className="text-2xl font-bold pt-8 ml-12">Lịch học của tôi</div>
            {/* Lịch + nội dung căn giữa */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start pt-8 md:pt-[100px] pb-8">
                {/* Calendar */}
                <div
                    className="flex flex-col items-start w-full max-w-[540px] min-w-[320px] md:min-h-[400px]"
                >
                    <div
                        ref={calendarRef}
                        className="bg-white rounded-2xl border shadow-lg p-8 w-full h-full flex flex-col items-center"
                    >
                        <div className="flex items-center justify-between w-full mb-2">
                            <button
                                className="text-xl px-2"
                                onClick={() => {
                                    if (month === 0) { setMonth(11); setYear(y => y - 1); }
                                    else setMonth(m => m - 1);
                                }}
                            >{'<'}</button>
                            <div className="font-semibold text-xl">
                                {`Tháng ${month + 1} Năm ${year}`}
                            </div>
                            <button
                                className="text-xl px-2"
                                onClick={() => {
                                    if (month === 11) { setMonth(0); setYear(y => y + 1); }
                                    else setMonth(m => m + 1);
                                }}
                            >{'>'}</button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-gray-500 mb-1 w-full text-base">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 w-full">
                            {matrix.flat().map((date, idx) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = isSameDay(date, selectedDate);
                                return (
                                    <div
                                        key={idx}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer select-none text-lg font-medium
                                            ${date.getMonth() === month
                                                ? (isSelected
                                                    ? 'bg-blue-200 text-blue-800 border-2 border-blue-500'
                                                    : isToday
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'hover:bg-blue-50')
                                                : 'text-gray-300'}
                                        `}
                                        onClick={() => date.getMonth() === month && setSelectedDate(date)}
                                    >
                                        <span>{date.getDate()}</span>
                                        {/* Dot if has schedule */}
                                        {date.getMonth() === month && daysWithSchedules.includes(date.getDate()) && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 inline-block"></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Schedule List Card */}
                <div
                    className="min-w-[300px] max-w-[350px] w-full mx-auto md:mx-0"
                    style={calendarHeight ? { minHeight: undefined, height: undefined, ...(window.innerWidth >= 768 ? { height: calendarHeight } : {}) } : {}}
                >
                    <div className="bg-[#ffe5e5] rounded-2xl shadow-lg p-6 flex flex-col justify-start h-full overflow-y-auto">
                        <div className="font-bold text-lg text-red-600 flex items-center gap-2 mb-4">
                            Lịch học
                            <span className="inline-flex items-center justify-center bg-red-500 text-white rounded-full w-7 h-7 text-base font-bold">{daySchedules.length}</span>
                        </div>
                        {loading ? (
                            <div className="text-gray-500 text-base py-8 text-center">Đang tải...</div>
                        ) : daySchedules.length === 0 ? (
                            <div className="text-gray-500 text-base py-8 text-center">Không có lịch học</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {daySchedules.map(s => (
                                    <div key={s.id} className="bg-white rounded-xl px-4 py-3 flex flex-col gap-1 shadow border border-[#ffd6d6]">
                                        <div className="flex gap-2 items-baseline mb-1">
                                            <span className="font-bold text-lg min-w-[60px] text-gray-800">{format(new Date(s.start), 'HH:mm')}</span>
                                            <span className="text-gray-400">-</span>
                                            <span className="font-bold text-lg text-gray-800">{format(new Date(s.end), 'HH:mm')}</span>
                                        </div>
                                        <div className="font-bold text-[16px] text-red-700 leading-tight mb-1">{s.className}</div>
                                        <div className="text-[14px] text-gray-600 leading-tight">{s.room}</div>
                                        <div className="text-[13px] text-gray-500 leading-tight">GV: {s.teacher}</div>
                                        <div className="text-[13px] text-gray-500 leading-tight">{s.level}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 