import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import teacherApi from '@/api/teacherApi';
import { Student, User } from '@/types/user';
import { ClassResponse } from '@/types/entityclass';
import { BookOpen } from 'lucide-react';

export default function ParentChildren() {
    const [children, setChildren] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    // State cho từng học sinh
    const [openClassList, setOpenClassList] = useState<string | null>(null); // userId của học sinh đang xem lớp
    const [studentClasses, setStudentClasses] = useState<Record<string, ClassResponse[]>>({}); // userId -> lớp[]

    // State cho xem chi tiết lớp
    const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(null);
    const [classStudents, setClassStudents] = useState<User[]>([]);
    const [classStudentsLoading, setClassStudentsLoading] = useState(false);
    const [selectedTeacherName, setSelectedTeacherName] = useState<string>('');

    useEffect(() => {
        async function fetchChildren() {
            setLoading(true);
            try {
                const user = localStorage.getItem('user');
                if (!user) return;
                const { userId } = JSON.parse(user);
                const parentRes = await parentApi.getById(userId);
                const studentIds = parentRes.data.result.studentIds || [];
                if (studentIds.length === 0) {
                    setChildren([]);
                    setLoading(false);
                    return;
                }
                const studentsRes = await studentApi.getByIds(studentIds);
                const students: Student[] = studentsRes.data.result || [];
                setChildren(students);
            } catch (err) {
                setChildren([]);
            }
            setLoading(false);
        }
        fetchChildren();
    }, []);

    // Khi bấm 'Xem thông tin lớp', lấy danh sách lớp cho học sinh đó
    const handleViewClasses = async (student: Student) => {
        setOpenClassList(student.userId);
        if (studentClasses[student.userId]) return; // đã có thì không gọi lại
        const res = await classApi.getAll(undefined, undefined, student.userId, undefined, 0, 100);
        let allClasses: ClassResponse[] = [];
        if (Array.isArray(res.data.result)) {
            allClasses = res.data.result;
        } else if (res.data.result && typeof res.data.result === 'object' && !Array.isArray(res.data.result) && 'content' in res.data.result) {
            allClasses = (res.data.result as any).content;
        }
        setStudentClasses(prev => ({ ...prev, [student.userId]: allClasses }));
    };

    // Khi bấm vào 1 lớp, lấy thông tin học sinh của lớp đó
    const handleSelectClass = async (cls: ClassResponse) => {
        setSelectedClass(cls);
        setClassStudentsLoading(true);
        try {
            // Lấy chi tiết lớp để lấy studentIds và teacherId
            const classDetailRes = await classApi.getById(cls.classId);
            const classDetail = classDetailRes.data.result;
            // Lấy tên giáo viên
            let teacherName = 'Chưa cập nhật';
            if (classDetail.teacherId) {
                try {
                    const teacherRes = await teacherApi.getById(classDetail.teacherId);
                    teacherName = teacherRes.data.result.fullName || teacherRes.data.result.username;
                } catch { }
            }
            setSelectedTeacherName(teacherName);
            // Lấy danh sách học sinh
            let students: User[] = [];
            if (classDetail.studentIds && classDetail.studentIds.length > 0) {
                const studentsRes = await studentApi.getByIds(classDetail.studentIds);
                students = studentsRes.data.result || [];
            }
            setClassStudents(students);
            setSelectedClass(classDetail);
        } catch {
            setClassStudents([]);
            setSelectedTeacherName('Chưa cập nhật');
        }
        setClassStudentsLoading(false);
    };

    // Khi bấm quay lại
    const handleBack = () => {
        setSelectedClass(null);
        setClassStudents([]);
        setSelectedTeacherName('');
    };

    return (<div className="space-y-6">
        <h1 className="text-3xl font-bold mb-8">Thông tin học sinh</h1>
        {loading ? (
            <div>Đang tải...</div>
        ) : (
            <div className="space-y-6">
                {children.map((child) => (
                    <Card key={child.userId}>
                        <div className="flex flex-row items-stretch">
                            {/* Thông tin học sinh bên trái */}
                            <div className="flex-1 p-6 flex flex-col justify-start">
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle>{child.fullName || child.username}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="mb-2 text-gray-700">
                                        Email: {child.email || 'Chưa cập nhật'}
                                    </div>
                                    <div className="mb-4 text-gray-700">
                                        Ngày sinh: {child.dob ? new Date(child.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => openClassList === child.userId ? setOpenClassList(null) : handleViewClasses(child)}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        {openClassList === child.userId ? 'Đóng danh sách lớp' : 'Xem thông tin lớp'}
                                    </Button>
                                </CardContent>
                            </div>
                            {/* Danh sách lớp bên phải */}
                            {openClassList === child.userId && (
                                <div className="flex flex-col justify-start min-w-[500px] max-w-xs mr-8 my-8">
                                    <div className="font-semibold mb-4 text-center">Danh sách lớp</div>
                                    {(studentClasses[child.userId]?.length === 0) && <div>Học sinh chưa tham gia lớp nào.</div>}
                                    {(studentClasses[child.userId] || []).map(cls => (
                                        <Button
                                            key={cls.classId}
                                            variant="outline" size="sm" className="w-full justify-center mb-2 text-center"
                                            onClick={() => handleSelectClass(cls)}
                                        >
                                            <div className="font-medium w-full text-center">{cls.className}</div>
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        )}

        {/* Dialog hiển thị chi tiết lớp */}
        <Dialog open={selectedClass !== null} onOpenChange={(open) => !open && handleBack()}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedClass?.className}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-row gap-8 mt-4">
                    {/* Thông tin lớp bên trái */}
                    <div className="flex-1">
                        <div className="space-y-3">
                            <div>Giáo viên: <span className="font-medium">{selectedTeacherName || 'Chưa cập nhật'}</span></div>
                            <div>Số lượng học sinh: <span className="font-medium">{classStudents.length}</span></div>
                            <div>Thời gian học: <span className="font-medium">{selectedClass?.daysOfWeek?.join(', ') || ''} {selectedClass?.startTime} - {selectedClass?.endTime}</span></div>
                            <div>Từ ngày: <span className="font-medium">{selectedClass?.startDate}</span></div>
                            <div>Đến ngày: <span className="font-medium">{selectedClass?.endDate}</span></div>
                            <div>Phòng học: <span className="font-medium">{selectedClass?.roomName}</span></div>
                        </div>
                    </div>
                    {/* Danh sách học sinh bên phải */}
                    <div className="flex-1">
                        <div className="font-semibold mb-4">Danh sách học sinh</div>
                        <ScrollArea className="h-[300px] pr-4">
                            {classStudentsLoading ? <div>Đang tải...</div> : (
                                classStudents.length === 0 ? <div>Không có học sinh nào.</div> :
                                    <div className="space-y-2">
                                        {classStudents.map(stu => (
                                            <div key={stu.userId} className="border rounded px-3 py-2 bg-white">
                                                {stu.fullName || stu.username}
                                            </div>
                                        ))}
                                    </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>);
} 
