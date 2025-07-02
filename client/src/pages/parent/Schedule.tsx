import { useState, useRef, useEffect } from 'react';
import { classApi } from '@/api/classApi';
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';
import { getUser } from '@/store/userStore';
import { ClassResponse } from '@/types/entityclass';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

function getMonthMatrix(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix = [];
    let week = [];
    let day = new Date(firstDay);
    // Số thứ tự ngày trong tuần của ngày đầu tháng (1=Mon, 0=Sun)
    let startDay = day.getDay() === 0 ? 7 : day.getDay();
    // Thêm ngày tháng trước nếu tuần đầu chưa đủ 7 ngày
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
    // Thêm ngày tháng sau nếu tuần cuối chưa đủ 7 ngày
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
            // Nếu ngày cuối tháng không phải CN, không cần thêm dòng thứ 6
            // Nhưng nếu matrix.length < 6 (tháng bắt đầu từ cuối tuần), vẫn cần đủ 6 dòng
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
            // Nếu ngày cuối tháng là CN, thêm dòng thứ 6
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

export default function ParentSchedule() {
    const [selectedChild, setSelectedChild] = useState('all');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [children, setChildren] = useState<{ id: string, name: string }[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);
    const [calendarHeight, setCalendarHeight] = useState<number | undefined>(undefined);

    // Lấy danh sách con từ parentApi và lấy tên thật từ studentApi
    useEffect(() => {
        async function fetchChildren() {
            const user = getUser();
            if (user && user.userId) {
                try {
                    const res = await parentApi.getById(user.userId);
                    const parent = res.data.result;
                    if (parent.studentIds && Array.isArray(parent.studentIds)) {
                        // Lấy tên thật từng học sinh
                        const childList: { id: string, name: string }[] = [];
                        for (const id of parent.studentIds) {
                            try {
                                const stuRes = await studentApi.getById(id);
                                const student = stuRes.data.result;
                                childList.push({ id, name: student.fullName || student.username || 'Học sinh' });
                            } catch {
                                childList.push({ id, name: 'Học sinh' });
                            }
                        }
                        setChildren(childList);
                    }
                } catch (e) {
                    setChildren([]);
                }
            }
        }
        fetchChildren();
    }, []);

    // Lấy danh sách lịch học từ API
    useEffect(() => {
        async function fetchSchedules() {
            setLoading(true);
            let allSchedules: any[] = [];
            for (const child of children) {
                try {
                    const res = await classApi.getAll(undefined, undefined, child.id, undefined, "OPEN", 0, 100);
                    const classes: ClassResponse[] = res.data.result.content || [];
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
                                        id: cls.classId + '-' + d + '-' + dow + '-' + cls.startTime + '-' + child.id,
                                        childId: child.id,
                                        childName: child.name,
                                        className: cls.className,
                                        room: cls.roomName,
                                        teacher: '',
                                        start: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${cls.startTime}`,
                                        end: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${cls.endTime}`,
                                    });
                                }
                            }
                        });
                    });
                } catch (e) {
                    // Bỏ qua lỗi từng học sinh
                }
            }
            setSchedules(allSchedules);
            setLoading(false);
        }
        if (children.length > 0) fetchSchedules();
    }, [children, month, year]);

    // Filter schedules for current child
    const filteredSchedules = schedules.filter(s => s.childId === selectedChild);

    // Get all days in month that have schedules
    const daysWithSchedules = filteredSchedules
        .map(s => new Date(s.start))
        .filter(d => d.getMonth() === month && d.getFullYear() === year)
        .map(d => d.getDate());

    // Schedules for selected day
    const daySchedules = filteredSchedules.filter(s =>
        isSameDay(new Date(s.start), selectedDate)
    ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    // Calendar matrix
    const matrix = getMonthMatrix(year, month);

    // Sync calendar height for schedule box
    useEffect(() => {
        if (calendarRef.current) {
            setCalendarHeight(calendarRef.current.offsetHeight);
        }
    }, [month, year, selectedDate, selectedChild]);

    return (
        <div className="w-full bg-[#f5f6fa]">
            {/* Tabs chọn con - sát lề trái, trên cùng */}
            <div className="pt-8 pl-12 flex gap-3">
                {children.map(child => (
                    <button
                        key={child.id}
                        className={`px-5 py-2 rounded-full border text-base font-medium transition-all duration-150 ${selectedChild === child.id ? 'bg-blue-100 border-blue-500 text-blue-700 shadow' : 'bg-white border-gray-300 hover:bg-gray-100'}`}
                        onClick={() => setSelectedChild(child.id)}
                    >{child.name}</button>
                ))}
            </div>

            {/* Lịch + nội dung căn giữa */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-start pt-8 md:pt-16 pb-8">
                {/* Calendar */}
                <div
                    className="flex flex-col items-start w-full max-w-xs md:max-w-[460px] min-w-[220px] md:min-h-[400px] mx-auto md:mx-0"
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
                            {matrix.flat().map((date, idx) => (
                                <div
                                    key={idx}
                                    className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer select-none text-lg font-medium
                    ${date.getMonth() === month
                                            ? (isSameDay(date, selectedDate) ? 'border-2 border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-blue-50')
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
                            ))}
                        </div>
                    </div>
                </div>

                {/* Schedule List Card */}
                <div
                    className="w-full max-w-xs md:min-w-[300px] md:max-w-[350px] mx-auto md:mx-0"
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
                                        {s.teacher && <div className="text-[13px] text-gray-500 leading-tight">{s.teacher}</div>}
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