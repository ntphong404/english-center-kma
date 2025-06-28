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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import teacherApi from '@/api/teacherApi';
import attendanceApi from '@/api/attendanceApi';
import { Student, User } from '@/types/user';
import { ClassResponse } from '@/types/entityclass';
import { AttendanceResponse } from '@/types/attendance';
import { BookOpen, Calendar, Clock, UserCheck, UserX } from 'lucide-react';

interface AttendanceStats {
    totalSessions: number;
    attendedSessions: number;
    absentSessions: number;
    attendanceDetails: Array<{
        date: string;
        status: string;
        note?: string;
    }>;
}

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
    
    // State cho thông tin điểm danh
    const [attendanceStats, setAttendanceStats] = useState<Record<string, AttendanceStats>>({});
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

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

    // Hàm lấy thông tin điểm danh của học sinh trong một lớp
    const fetchAttendanceStats = async (studentId: string, classId: string) => {
        setAttendanceLoading(true);
        try {
            const res = await attendanceApi.getAll(studentId, classId, undefined, 0, 1000);
            let result = res.data.result;
            let attendances: AttendanceResponse[] = [];
            
            if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                attendances = result.content;
            } else if (Array.isArray(result)) {
                attendances = result;
            }

            // Tính toán thống kê
            let attendedSessions = 0;
            let absentSessions = 0;
            const attendanceDetails: Array<{date: string, status: string, note?: string}> = [];

            attendances.forEach(attendance => {
                const studentAttendance = attendance.studentAttendances.find(sa => sa.studentId === studentId);
                if (studentAttendance) {
                    const status = studentAttendance.status;
                    const date = new Date(attendance.date).toLocaleDateString('vi-VN');
                    const note = studentAttendance.note;
                    
                    attendanceDetails.push({ date, status, note });
                    
                    if (status === 'PRESENT' || status === 'present') {
                        attendedSessions++;
                    } else if (status === 'ABSENT' || status === 'absent') {
                        absentSessions++;
                    }
                }
            });

            const stats: AttendanceStats = {
                totalSessions: attendances.length,
                attendedSessions,
                absentSessions,
                attendanceDetails: attendanceDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            };

            setAttendanceStats(prev => ({
                ...prev,
                [`${studentId}-${classId}`]: stats
            }));
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
            setAttendanceStats(prev => ({
                ...prev,
                [`${studentId}-${classId}`]: {
                    totalSessions: 0,
                    attendedSessions: 0,
                    absentSessions: 0,
                    attendanceDetails: []
                }
            }));
        }
        setAttendanceLoading(false);
    };

    // Khi bấm vào 1 lớp, lấy thông tin học sinh của lớp đó
    const handleSelectClass = async (cls: ClassResponse, studentId: string) => {
        setSelectedClass(cls);
        setSelectedStudentId(studentId);
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

            // Lấy thông tin điểm danh của học sinh trong lớp này
            await fetchAttendanceStats(studentId, cls.classId);
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
        setSelectedStudentId('');
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Có mặt</Badge>;
            case 'absent':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Vắng mặt</Badge>;
            case 'late':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Đi muộn</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
        }
    };

    const currentStats = selectedStudentId && selectedClass 
        ? attendanceStats[`${selectedStudentId}-${selectedClass.classId}`] 
        : null;

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
                                            onClick={() => handleSelectClass(cls, child.userId)}
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
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{selectedClass?.className}</DialogTitle>
                </DialogHeader>
                
                <Tabs defaultValue="class-info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="class-info">Thông tin lớp</TabsTrigger>
                        <TabsTrigger value="attendance-stats">Thống kê điểm danh</TabsTrigger>
                        <TabsTrigger value="attendance-details">Chi tiết buổi học</TabsTrigger>
                    </TabsList>

                    <TabsContent value="class-info" className="space-y-4">
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
                    </TabsContent>

                    <TabsContent value="attendance-stats" className="space-y-4">
                        {attendanceLoading ? (
                            <div className="text-center py-8">Đang tải thống kê điểm danh...</div>
                        ) : currentStats ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <Calendar className="mr-2 h-5 w-5" />
                                            Tổng số buổi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-600">{currentStats.totalSessions}</div>
                                        <p className="text-sm text-gray-500">Buổi học đã diễn ra</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <UserCheck className="mr-2 h-5 w-5" />
                                            Có mặt
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-600">{currentStats.attendedSessions}</div>
                                        <p className="text-sm text-gray-500">
                                            {currentStats.totalSessions > 0 
                                                ? `${Math.round((currentStats.attendedSessions / currentStats.totalSessions) * 100)}% tỷ lệ có mặt`
                                                : 'Chưa có buổi học'
                                            }
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center">
                                            <UserX className="mr-2 h-5 w-5" />
                                            Vắng mặt
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-red-600">{currentStats.absentSessions}</div>
                                        <p className="text-sm text-gray-500">
                                            {currentStats.totalSessions > 0 
                                                ? `${Math.round((currentStats.absentSessions / currentStats.totalSessions) * 100)}% tỷ lệ vắng mặt`
                                                : 'Chưa có buổi học'
                                            }
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">Không có dữ liệu điểm danh</div>
                        )}
                    </TabsContent>

                    <TabsContent value="attendance-details" className="space-y-4">
                        {attendanceLoading ? (
                            <div className="text-center py-8">Đang tải chi tiết buổi học...</div>
                        ) : currentStats && currentStats.attendanceDetails.length > 0 ? (
                            <div className="mt-4">
                                <div className="font-semibold mb-4">Chi tiết từng buổi học:</div>
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="space-y-3">
                                        {currentStats.attendanceDetails.map((detail, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{detail.date}</span>
                                                    </div>
                                                    {getStatusBadge(detail.status)}
                                                </div>
                                                {detail.note && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <span className="font-medium">Ghi chú:</span> {detail.note}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">Chưa có dữ liệu điểm danh chi tiết</div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    </div>);
} 
