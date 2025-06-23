import { useEffect, useState } from 'react';
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
    MONDAY: "Thứ 2",
    TUESDAY: "Thứ 3",
    WEDNESDAY: "Thứ 4",
    THURSDAY: "Thứ 5",
    FRIDAY: "Thứ 6",
    SATURDAY: "Thứ 7",
    SUNDAY: "Chủ nhật"
};

function getDayOfWeekVN(date: Date) {
    const day = date.getDay();
    return daysOfWeek[day === 0 ? 6 : day - 1];
}

export default function TeacherSchedule() {
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [selectedDay, setSelectedDay] = useState<string>(getDayOfWeekVN(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const { toast } = useToast();
    const [studentDialogOpen, setStudentDialogOpen] = useState(false);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentPage, setStudentPage] = useState(0);
    const [studentHasMore, setStudentHasMore] = useState(true);
    const STUDENT_PAGE_SIZE = 10;
    const [currentClass, setCurrentClass] = useState<ClassResponse | null>(null);

    useEffect(() => {
        const fetchClasses = async () => {
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
        };
        fetchClasses();
    }, []);

    // Lọc theo thứ
    const filteredSchedules = classes.filter(cls =>
        cls.daysOfWeek?.some(day => dayMap[day] === selectedDay)
    );
    // Lọc theo ngày
    const filteredByDate = classes.filter(cls =>
        cls.daysOfWeek?.some(day => dayMap[day] === getDayOfWeekVN(selectedDate))
    );

    const handleShowStudents = async (cls: ClassResponse) => {
        setCurrentClass(cls);
        setStudentDialogOpen(true);
        setStudentPage(0);
        setStudentHasMore(true);
        if (cls.studentIds.length === 0) {
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lịch dạy</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo thứ</CardTitle>
                        <CardDescription>
                            Xem lịch dạy theo từng ngày trong tuần
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
                                {filteredSchedules.length === 0 && <div>Không có lớp nào.</div>}
                                {filteredSchedules.map((cls) => (
                                    <div
                                        key={cls.classId}
                                        className="p-4 border rounded-lg space-y-2"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">{cls.className}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Trình độ: {cls.grade}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {cls.startTime} - {cls.endTime}
                                                </p>
                                                <p className="text-sm text-gray-500">{cls.roomName}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <p>Sĩ số: {cls.studentIds.length}</p>
                                            <Button variant="outline" size="sm" onClick={() => handleShowStudents(cls)}>
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo ngày</CardTitle>
                        <CardDescription>
                            Chọn ngày để xem lịch dạy
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
                                Lịch dạy ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
                            </h3>
                            <div className="space-y-2">
                                {filteredByDate.length === 0 && <div>Không có lớp nào.</div>}
                                {filteredByDate.map((cls) => (
                                    <div
                                        key={cls.classId}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span>{cls.className}</span>
                                        <span>
                                            {cls.startTime} - {cls.endTime}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
                <DialogContent className="max-w-lg w-full">
                    <DialogHeader>
                        <DialogTitle>Danh sách học sinh</DialogTitle>
                        <DialogDescription>
                            {currentClass?.className} ({currentClass?.studentIds.length || 0} học sinh)
                        </DialogDescription>
                    </DialogHeader>
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
                        <DialogFooter>
                            <Button variant="outline" onClick={handleLoadMoreStudents}>Xem thêm</Button>
                        </DialogFooter>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Đóng</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 