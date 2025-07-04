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
import { getUser } from '@/store/userStore';
import { ClassResponse } from '@/types/entityclass';
import { useToast } from '@/components/ui/use-toast';
import studentApi from '@/api/studentApi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import CustomDialog from '@/components/CustomDialog';

interface Schedule {
    id: string;
    className: string;
    room: string;
    start: string;
    end: string;
    level: string;
    studentCount: number;
    classId: string;
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

export default function TeacherSchedule() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const teacherId = getUser()?.userId;
    const [calendarHeight, setCalendarHeight] = useState<number | null>(null);
    const [studentDialogOpen, setStudentDialogOpen] = useState(false);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentPage, setStudentPage] = useState(0);
    const [studentHasMore, setStudentHasMore] = useState(true);
    const STUDENT_PAGE_SIZE = 10;
    const [currentClass, setCurrentClass] = useState<ClassResponse | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
            if (!teacherId) return;
            setLoading(true);
            try {
                const res = await classApi.getAll(undefined, teacherId as string, undefined, undefined, "OPEN", 0, 100);
                let result = res.data.result;
                let newClasses: ClassResponse[] = [];
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    newClasses = result.content;
                } else if (Array.isArray(result)) {
                    newClasses = result;
                }
                setClasses(newClasses);
            } catch (error) {
                toast({ title: 'Lỗi', description: 'Không thể tải lịch dạy', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, [teacherId, toast]);

    // Tạo lịch dạy từ danh sách lớp
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
                            room: cls.roomName,
                            start: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${cls.startTime}`,
                            end: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${cls.endTime}`,
                            level: `Khối ${cls.grade}`,
                            studentCount: cls.studentIds?.length || 0,
                            classId: cls.classId
                        });
                    }
                }
            });
        });
        setSchedules(allSchedules);
    }, [classes, month, year]);

    // Lọc lịch dạy theo ngày được chọn
    const daySchedules = schedules.filter(s =>
        isSameDay(new Date(s.start), selectedDate)
    ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Lấy tất cả ngày trong tháng có lịch dạy
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

    const handleShowStudents = async (classId: string) => {
        const cls = classes.find(c => c.classId === classId);
        if (!cls) return;

        setCurrentClass(cls);
        setStudentDialogOpen(true);
        setStudentPage(0);
        setStudentHasMore(true);
        if (!cls.studentIds || cls.studentIds.length === 0) {
            setStudentList([]);
            setStudentHasMore(false);
            return;
        }
        const ids = cls.studentIds.slice(0, STUDENT_PAGE_SIZE);
        try {
            const res = await studentApi.getByIds(ids);
            setStudentList(res.data.result || []);
            setStudentHasMore(cls.studentIds.length > STUDENT_PAGE_SIZE);
        } catch {
            setStudentList([]);
            setStudentHasMore(false);
        }
    };

    const handleLoadMoreStudents = async () => {
        if (!currentClass) return;
        const start = (studentPage + 1) * STUDENT_PAGE_SIZE;
        const ids = currentClass.studentIds.slice(start, start + STUDENT_PAGE_SIZE);
        try {
            const res = await studentApi.getByIds(ids);
            setStudentList(prev => [...prev, ...(res.data.result || [])]);
            setStudentPage(prev => prev + 1);
            setStudentHasMore(currentClass.studentIds.length > start + STUDENT_PAGE_SIZE);
        } catch {
            setStudentHasMore(false);
        }
    };

    return (
        <div className="w-full bg-[#f5f6fa]">
            {/* Tiêu đề lớn */}
            <div className="text-2xl font-bold pt-8 ml-12">Lịch dạy của tôi</div>
            {/* Lịch + nội dung căn giữa */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start pb-8 w-full">
                {/* Calendar */}
                <div
                    className="flex flex-col items-center w-full max-w-[540px] min-w-[320px] mx-auto"
                >
                    <div
                        ref={calendarRef}
                        className="bg-white rounded-3xl border shadow-2xl p-10 w-full h-full flex flex-col items-center"
                    >
                        <div className="flex items-center justify-between w-full mb-4">
                            <button
                                className="text-2xl px-3"
                                onClick={() => {
                                    if (month === 0) { setMonth(11); setYear(y => y - 1); }
                                    else setMonth(m => m - 1);
                                }}
                            >{'<'}</button>
                            <div className="font-semibold text-2xl">
                                {`Tháng ${month + 1} Năm ${year}`}
                            </div>
                            <button
                                className="text-2xl px-3"
                                onClick={() => {
                                    if (month === 11) { setMonth(0); setYear(y => y + 1); }
                                    else setMonth(m => m + 1);
                                }}
                            >{'>'}</button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-gray-500 mb-2 w-full text-lg">
                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2 w-full">
                            {matrix.flat().map((date, idx) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = isSameDay(date, selectedDate);
                                return (
                                    <div
                                        key={idx}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer select-none text-xl font-semibold
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
                                            <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 inline-block"></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                {/* Schedule List Card */}
                <div
                    className="flex flex-col items-center w-full max-w-[540px] min-w-[320px] mx-auto mt-8 md:mt-0"
                    style={calendarHeight ? { minHeight: undefined, height: undefined, ...(window.innerWidth >= 768 ? { height: calendarHeight } : {}) } : {}}
                >
                    <div className="bg-[#ffe5e5] rounded-3xl shadow-2xl p-6 flex flex-col justify-start h-full w-full overflow-y-auto">
                        <div className="font-bold text-lg text-red-600 flex items-center gap-2 mb-4">
                            Lịch dạy
                            <span className="inline-flex items-center justify-center bg-red-500 text-white rounded-full w-7 h-7 text-base font-bold">{daySchedules.length}</span>
                        </div>
                        {loading ? (
                            <div className="text-gray-500 text-base py-8 text-center">Đang tải...</div>
                        ) : daySchedules.length === 0 ? (
                            <div className="text-gray-500 text-base py-8 text-center">Không có lịch dạy</div>
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
                                        <div className="text-[13px] text-gray-500 leading-tight">{s.level}</div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-[13px] text-gray-500 leading-tight">Sĩ số: {s.studentCount}</div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleShowStudents(s.classId)}
                                                className="text-xs h-7 px-2"
                                            >
                                                Xem học sinh
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog xem học sinh */}
            <CustomDialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen} title="Danh sách học sinh">
                <div className="text-muted-foreground mb-2">{currentClass?.className} ({currentClass?.studentIds?.length || 0} học sinh)</div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {studentList.length === 0 && <div>Không có học sinh nào.</div>}
                    {studentList.map(stu => (
                        <div key={stu.userId} className="border-b py-2">
                            <div className="font-medium">{stu.fullName || stu.username}</div>
                            <div className="text-sm text-gray-500">Email: {stu.email || '---'}</div>
                        </div>
                    ))}
                </div>
                {studentHasMore && (
                    <div className="flex justify-end mt-2">
                        <Button variant="outline" onClick={handleLoadMoreStudents}>Xem thêm</Button>
                    </div>
                )}
                <div className="flex justify-end mt-2">
                    <Button variant="outline" onClick={() => setStudentDialogOpen(false)}>Đóng</Button>
                </div>
            </CustomDialog>
        </div>
    );
}
