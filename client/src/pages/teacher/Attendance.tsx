import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUser } from '@/store/userStore';
import { classApi } from '@/api/classApi';
import attendanceApi from '@/api/attendanceApi';
import { ClassResponse } from '@/types/entityclass';
import { AttendanceResponse, StudentAttendance } from '@/types/attendance';
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, X } from "lucide-react";
import studentApi from '@/api/studentApi';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export default function TeacherAttendance() {
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(null);
    const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editAttendance, setEditAttendance] = useState<StudentAttendance[]>([]);
    const [studentMap, setStudentMap] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [editStudent, setEditStudent] = useState<StudentAttendance | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<AttendanceResponse[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyHasMore, setHistoryHasMore] = useState(true);
    const HISTORY_PAGE_SIZE = 5;
    const { toast } = useToast();
    const [classPage, setClassPage] = useState(0);
    const [classHasMore, setClassHasMore] = useState(true);
    const CLASS_PAGE_SIZE = 10;

    useEffect(() => {
        const fetchClasses = async () => {
            const user = getUser();
            if (user) {
                try {
                    const res = await classApi.getAll(undefined, user.userId, undefined, undefined, 0, CLASS_PAGE_SIZE, "className,ASC");
                    let result = res.data.result;
                    let newClasses: ClassResponse[] = [];
                    if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                        newClasses = result.content;
                        setClassHasMore((result as any).page && ((result as any).page.number + 1) < (result as any).page.totalPages);
                    } else if (Array.isArray(result)) {
                        newClasses = result;
                        setClassHasMore(false);
                    }
                    setClasses(newClasses);
                    setClassPage(1);
                } catch {
                    toast({ title: 'Lỗi', description: 'Không thể tải danh sách lớp.' });
                }
            }
        };
        fetchClasses();
    }, []);

    const handleSelectClass = (cls: ClassResponse) => {
        setSelectedClass(cls);
        setAttendance(null);
        setError(null);
        setShowHistory(false);
    };

    const handleAttendance = async () => {
        if (!selectedClass) return;
        setLoading(true);
        setError(null);
        try {
            const res = await attendanceApi.getTodayByClass(selectedClass.classId);
            let attRaw = res.data.result;
            let att: AttendanceResponse | null = null;
            if (Array.isArray(attRaw)) {
                att = attRaw.length > 0 ? attRaw[0] : null;
            } else if (attRaw && typeof attRaw === 'object' && 'studentAttendances' in attRaw) {
                att = attRaw as AttendanceResponse;
            }
            if (att) {
                setAttendance(att);
                setEditAttendance(att.studentAttendances.map(s => ({ ...s })));
                // Fetch student names
                if (selectedClass.studentIds.length > 0) {
                    const stuRes = await studentApi.getByIds(selectedClass.studentIds);
                    const map: Record<string, string> = {};
                    (stuRes.data.result || []).forEach((stu: any) => {
                        map[stu.userId] = stu.fullName || stu.username;
                    });
                    setStudentMap(map);
                }
                setDialogOpen(true);
            } else {
                toast({ title: 'Lỗi', description: 'Chưa có dữ liệu điểm danh cho hôm nay.' });
            }
        } catch {
            toast({ title: 'Lỗi', description: 'Không thể tải dữ liệu điểm danh.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEditStatus = (studentId: string, status: string) => {
        setEditAttendance(prev => prev.map(s => s.studentId === studentId ? { ...s, status } : s));
    };

    const handleEditNote = (studentId: string, note: string) => {
        setEditAttendance(prev => prev.map(s => s.studentId === studentId ? { ...s, note } : s));
    };

    const handleSaveAttendance = async () => {
        if (!attendance) return;
        setSaving(true);
        try {
            await attendanceApi.patch(attendance.attendanceId, {
                date: attendance.date,
                studentAttendances: editAttendance,
            });
            setDialogOpen(false);
            setAttendance({ ...attendance, studentAttendances: editAttendance });
        } catch {
            toast({ title: 'Lỗi', description: 'Lưu điểm danh thất bại.' });
        } finally {
            setSaving(false);
        }
    };

    const handleShowHistory = async () => {
        if (!selectedClass) return;
        setShowHistory(v => !v);
        if (!showHistory) {
            setHistoryLoading(true);
            setHistoryPage(0);
            try {
                const res = await attendanceApi.getAll(undefined, selectedClass.classId, undefined, 0, HISTORY_PAGE_SIZE, "date,desc");
                let result = res.data.result;
                let newHistory: AttendanceResponse[] = [];
                let hasMore = false;
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    newHistory = result.content.flat();
                    hasMore = (result as any).page && ((result as any).page.number + 1) < (result as any).page.totalPages;
                } else if (Array.isArray(result)) {
                    newHistory = result;
                    hasMore = false;
                }
                setHistory(newHistory);
                setHistoryHasMore(hasMore);
                setHistoryPage(1);
            } catch {
                setHistory([]);
                setHistoryHasMore(false);
            } finally {
                setHistoryLoading(false);
            }
        }
    };

    const handleLoadMoreHistory = async () => {
        if (!selectedClass) return;
        setHistoryLoading(true);
        try {
            const res = await attendanceApi.getAll(undefined, selectedClass.classId, undefined, historyPage, HISTORY_PAGE_SIZE, "date,desc");
            let result = res.data.result;
            let newHistory: AttendanceResponse[] = [];
            let hasMore = false;
            if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                newHistory = result.content.flat();
                hasMore = (result as any).page && ((result as any).page.number + 1) < (result as any).page.totalPages;
            } else if (Array.isArray(result)) {
                newHistory = result;
                hasMore = false;
            }
            setHistory(prev => [...prev, ...newHistory]);
            setHistoryHasMore(hasMore);
            setHistoryPage(prev => prev + 1);
        } catch {
            setHistoryHasMore(false);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleOpenHistoryDialog = async (att: AttendanceResponse) => {
        setAttendance(att);
        setEditAttendance(att.studentAttendances.map(s => ({ ...s })));
        // Fetch student names
        if (selectedClass && selectedClass.studentIds.length > 0) {
            const stuRes = await studentApi.getByIds(selectedClass.studentIds);
            const map: Record<string, string> = {};
            (stuRes.data.result || []).forEach((stu: any) => {
                map[stu.userId] = stu.fullName || stu.username;
            });
            setStudentMap(map);
        }
        setDialogOpen(true);
    };

    const handleLoadMoreClass = async () => {
        const user = getUser();
        if (user) {
            try {
                const res = await classApi.getAll(undefined, user.userId, undefined, undefined, classPage, CLASS_PAGE_SIZE, "className,ASC");
                let result = res.data.result;
                let newClasses: ClassResponse[] = [];
                let hasMore = false;
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    newClasses = result.content;
                    hasMore = (result as any).page && ((result as any).page.number + 1) < (result as any).page.totalPages;
                } else if (Array.isArray(result)) {
                    newClasses = result;
                    hasMore = false;
                }
                setClasses(prev => [...prev, ...newClasses]);
                setClassPage(prev => prev + 1);
                setClassHasMore(hasMore);
            } catch {
                toast({ title: 'Lỗi', description: 'Không thể tải thêm lớp.' });
            }
        }
    };

    return (
        <div className="flex gap-6">
            {/* Left: Class List */}
            <div className="w-1/3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách lớp</CardTitle>
                        <CardDescription>Chọn lớp để xem thông tin và điểm danh</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            {classes.length === 0 && <div>Không có lớp nào.</div>}
                            {classes.map(cls => (
                                <Button
                                    key={cls.classId}
                                    variant={selectedClass?.classId === cls.classId ? "default" : "outline"}
                                    onClick={() => handleSelectClass(cls)}
                                    className="justify-start"
                                >
                                    {cls.className}
                                </Button>
                            ))}
                            {classHasMore && (
                                <Button variant="outline" onClick={handleLoadMoreClass} className="mt-2">Xem thêm lớp</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Class Info & Attendance */}
            <div className="w-2/3 space-y-4">
                {selectedClass ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lớp: {selectedClass.className}</CardTitle>
                            <CardDescription>
                                Sĩ số: {selectedClass.studentIds.length} <br />
                                Phòng: {selectedClass.roomName} <br />
                                Ngày bắt đầu: {format(new Date(selectedClass.startDate), 'dd/MM/yyyy', { locale: vi })}<br />
                                Thời gian học: {selectedClass.startTime} - {selectedClass.endTime} <br />
                                Các ngày học: {selectedClass.daysOfWeek && selectedClass.daysOfWeek.length > 0 ? selectedClass.daysOfWeek.map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(', ') : 'Không rõ'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleAttendance} disabled={loading}>
                                {loading ? 'Đang tải...' : 'Điểm danh hôm nay'}
                            </Button>
                            <Button onClick={handleShowHistory} variant="outline" className="ml-2">
                                {showHistory ? 'Ẩn lịch sử điểm danh' : 'Xem lịch sử điểm danh'}
                            </Button>
                            {showHistory && (
                                <div className="mt-4">
                                    {historyLoading && history.length === 0 ? (
                                        <div>Đang tải lịch sử...</div>
                                    ) : history.length === 0 ? (
                                        <div>Không có lịch sử điểm danh.</div>
                                    ) : (
                                        <>
                                            <div className="border rounded-lg divide-y">
                                                {history.map((att, idx) => (
                                                    <div
                                                        key={att.attendanceId}
                                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                        onClick={() => handleOpenHistoryDialog(att)}
                                                    >
                                                        <div className="font-medium">
                                                            {typeof selectedClass?.className === 'string' ? selectedClass.className : 'Tên lớp'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{att.date ? format(new Date(att.date), 'dd/MM/yyyy', { locale: vi }) : ''}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {historyHasMore && !historyLoading && (
                                                <div className="flex justify-center mt-2">
                                                    <Button variant="outline" onClick={handleLoadMoreHistory}>
                                                        Xem thêm
                                                    </Button>
                                                </div>
                                            )}
                                            {historyLoading && history.length > 0 && (
                                                <div className="flex justify-center mt-2 text-sm text-gray-500">Đang tải thêm...</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {error && <div className="text-red-500 mt-2">{error}</div>}
                            {attendance && (
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogContent className="max-w-4xl w-full h-[700px] flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Điểm danh lớp {selectedClass?.className}</DialogTitle>
                                            <DialogDescription>Ngày: {attendance.date ? format(new Date(attendance.date), 'dd/MM/yyyy', { locale: vi }) : ''}</DialogDescription>
                                        </DialogHeader>
                                        <div className="flex-1 overflow-y-auto flex flex-col gap-6">
                                            {editAttendance.map((student, idx) => (
                                                <div
                                                    key={student.studentId}
                                                    className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 border-b pb-2"
                                                >
                                                    <div className="font-medium min-w-[120px] md:w-1/4">{studentMap[student.studentId] || student.studentId}</div>
                                                    <div className="flex gap-6 items-center md:w-1/4">
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                checked={student.status === 'PRESENT'}
                                                                onChange={() => handleEditStatus(student.studentId, 'PRESENT')}
                                                            />
                                                            Có mặt
                                                        </label>
                                                        <label className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                checked={student.status === 'ABSENT'}
                                                                onChange={() => handleEditStatus(student.studentId, 'ABSENT')}
                                                            />
                                                            Vắng
                                                        </label>
                                                    </div>
                                                    <div className="md:w-2/4 w-full md:pl-8">
                                                        <Input
                                                            className="mt-1 md:mt-0"
                                                            value={student.note || ''}
                                                            onChange={e => handleEditNote(student.studentId, e.target.value)}
                                                            placeholder="Ghi chú"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                onClick={handleSaveAttendance}
                                                disabled={saving}
                                            >
                                                {saving ? 'Đang lưu...' : 'Lưu'}
                                            </Button>
                                            <DialogClose asChild>
                                                <Button variant="outline">Đóng</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Chọn lớp để xem thông tin</CardTitle>
                        </CardHeader>
                    </Card>
                )}
            </div>
        </div>
    );
} 