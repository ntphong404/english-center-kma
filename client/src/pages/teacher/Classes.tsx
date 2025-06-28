import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { classApi } from '@/api/classApi';
import { getUser } from '@/store/userStore';
import { ClassResponse } from '@/types/entityclass';
import { useToast } from '@/components/ui/use-toast';
import studentApi from '@/api/studentApi';
import attendanceApi from '@/api/attendanceApi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';

export default function TeacherClasses() {
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const PAGE_SIZE = 10;
    const { toast } = useToast();
    const [studentDialogOpen, setStudentDialogOpen] = useState(false);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentPage, setStudentPage] = useState(0);
    const [studentHasMore, setStudentHasMore] = useState(true);
    const STUDENT_PAGE_SIZE = 10;
    const [currentClass, setCurrentClass] = useState<ClassResponse | null>(null);
    const [attendanceCounts, setAttendanceCounts] = useState<Record<string, number>>({});

    // Hàm đếm số buổi học đã có cho một lớp
    const fetchAttendanceCount = async (classId: string) => {
        try {
            const res = await attendanceApi.getAll(undefined, classId, undefined, 0, 1000);
            let result = res.data.result;
            let attendances: any[] = [];
            
            if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                attendances = result.content;
            } else if (Array.isArray(result)) {
                attendances = result;
            }
            
            setAttendanceCounts(prev => ({
                ...prev,
                [classId]: attendances.length
            }));
        } catch (error) {
            console.error('Error fetching attendance count:', error);
            setAttendanceCounts(prev => ({
                ...prev,
                [classId]: 0
            }));
        }
    };

    useEffect(() => {
        const fetchClasses = async () => {
            const user = getUser();
            if (user) {
                try {
                    const res = await classApi.getAll(undefined, user.userId, undefined, undefined, 0, PAGE_SIZE, "className,ASC");
                    let result = res.data.result;
                    let newClasses: ClassResponse[] = [];
                    let more = false;
                    if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                        newClasses = result.content;
                        more = (result as any).page && ((result as any).page.number + 1) < (result as any).page.totalPages;
                    } else if (Array.isArray(result)) {
                        newClasses = result;
                        more = false;
                    }
                    setClasses(newClasses);
                    setHasMore(more);
                    setPage(1);

                    // Đếm số buổi học cho từng lớp
                    for (const classItem of newClasses) {
                        await fetchAttendanceCount(classItem.classId);
                    }
                } catch {
                    toast({ title: 'Lỗi', description: 'Không thể tải danh sách lớp.' });
                }
            }
        };
        fetchClasses();
    }, []);

    const handleLoadMore = async () => {
        const user = getUser();
        if (user) {
            try {
                const res = await classApi.getAll(undefined, user.userId, undefined, undefined, page, PAGE_SIZE, "className,ASC");
                let result = res.data.result;
                let newClasses: ClassResponse[] = [];
                let more = false;
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    newClasses = result.content;
                    more = (result as any).page && ((result as any).page.number + 1) < (result as any).page.totalPages;
                } else if (Array.isArray(result)) {
                    newClasses = result;
                    more = false;
                }
                setClasses(prev => [...prev, ...newClasses]);
                setHasMore(more);
                setPage(prev => prev + 1);

                // Đếm số buổi học cho các lớp mới
                for (const classItem of newClasses) {
                    await fetchAttendanceCount(classItem.classId);
                }
            } catch {
                toast({ title: 'Lỗi', description: 'Không thể tải thêm lớp.' });
            }
        }
    };

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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lớp học của tôi</h2>
            </div>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold text-gray-700">Tên lớp</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-center">Số học viên</TableHead>
                            <TableHead className="font-semibold text-gray-700">Lịch học</TableHead>
                            <TableHead className="font-semibold text-gray-700">Trình độ</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-center">Tổng số buổi đã dạy</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="text-lg">📚</div>
                                        <div>Không có lớp nào.</div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                        {classes.map((classItem, index) => (
                            <TableRow key={classItem.classId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <TableCell className="font-medium text-gray-900">
                                    {classItem.className}
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
                                        {classItem.studentIds.length}
                                    </span>
                                </TableCell>
                                <TableCell className="text-gray-700">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium">
                                            {classItem.daysOfWeek?.join(', ')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {classItem.startTime} - {classItem.endTime}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {classItem.grade}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 font-semibold text-sm">
                                        {attendanceCounts[classItem.classId] || 0}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleShowStudents(classItem)}
                                        className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {hasMore && (
                    <div className="flex justify-center py-4 border-t bg-gray-50">
                        <Button 
                            variant="outline" 
                            onClick={handleLoadMore}
                            className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                            Xem thêm lớp
                        </Button>
                    </div>
                )}
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