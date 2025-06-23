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

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên lớp</TableHead>
                            <TableHead>Số học viên</TableHead>
                            <TableHead>Lịch học</TableHead>
                            <TableHead>Trình độ</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Không có lớp nào.</TableCell>
                            </TableRow>
                        )}
                        {classes.map((classItem) => (
                            <TableRow key={classItem.classId}>
                                <TableCell>{classItem.className}</TableCell>
                                <TableCell>{classItem.studentIds.length}</TableCell>
                                <TableCell>
                                    {classItem.daysOfWeek?.join(', ')}<br />
                                    {classItem.startTime} - {classItem.endTime}
                                </TableCell>
                                <TableCell>{classItem.grade}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleShowStudents(classItem)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {hasMore && (
                    <div className="flex justify-center my-2">
                        <Button variant="outline" onClick={handleLoadMore}>Xem thêm lớp</Button>
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