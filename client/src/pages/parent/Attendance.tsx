import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import parentApi from "@/api/parentApi";
import studentApi from "@/api/studentApi";
import { Student } from "@/types/user";
import { getUser } from '@/store/userStore';
import attendanceApi from '@/api/attendanceApi';
import { classApi } from '@/api/classApi';

export default function StudentAttendance() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

    useEffect(() => {
        async function fetchChildren() {
            setLoading(true);
            try {
                const user = getUser();
                if (!user?.userId) return;
                const parentRes = await parentApi.getById(user.userId);
                const studentIds = parentRes.data.result.studentIds || [];
                if (studentIds.length === 0) {
                    setChildren([]);
                    setLoading(false);
                    return;
                }
                const studentsRes = await studentApi.getByIds(studentIds);
                const students: Student[] = studentsRes.data.result || [];
                setChildren(students);
                if (students.length > 0) {
                    setSelectedStudentId(students[0].userId);
                }
            } catch (err) {
                setChildren([]);
            }
            setLoading(false);
        }
        fetchChildren();
    }, []);

    useEffect(() => {
        async function fetchClasses() {
            if (!selectedStudentId) return;
            setLoading(true);
            try {
                const res = await classApi.getAll(undefined, undefined, selectedStudentId, undefined, "OPEN", 0, 100);
                const classList = res.data.result.content || [];
                setClasses(classList);
                if (classList.length > 0) {
                    setSelectedClassId(classList[0].classId);
                } else {
                    setSelectedClassId(null);
                }
            } catch {
                setClasses([]);
                setSelectedClassId(null);
            }
            setLoading(false);
        }
        fetchClasses();
    }, [selectedStudentId]);

    useEffect(() => {
        async function fetchAttendance() {
            if (!selectedStudentId || !selectedClassId) {
                setAttendanceRecords([]);
                return;
            }
            setLoading(true);
            try {
                const res = await attendanceApi.getAll(selectedStudentId, selectedClassId, '', 0, 100);
                const result = res.data.result;
                let records: any[] = [];
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    records = result.content;
                } else if (Array.isArray(result)) {
                    records = result;
                }
                // Lấy điểm danh của học sinh này trong từng buổi
                const mapped = records.map((att: any) => {
                    const studentAtt = att.studentAttendances.find((sa: any) => sa.studentId === selectedStudentId);
                    return {
                        id: att.attendanceId,
                        date: att.date,
                        status: studentAtt?.status || 'UNKNOWN',
                        note: studentAtt?.note || ''
                    };
                });
                setAttendanceRecords(mapped);
            } catch {
                setAttendanceRecords([]);
            }
            setLoading(false);
        }
        fetchAttendance();
    }, [selectedStudentId, selectedClassId]);

    const attendanceStats = {
        total: attendanceRecords.length,
        present: attendanceRecords.filter((r) => r.status === "PRESENT").length,
        absent: attendanceRecords.filter((r) => r.status === "ABSENT").length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PRESENT":
                return (
                    <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" /> Có mặt
                    </Badge>
                );
            case "ABSENT":
                return (
                    <Badge className="bg-red-500">
                        <X className="h-3 w-3 mr-1" /> Vắng mặt
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-400">
                        <Clock className="h-3 w-3 mr-1" /> Chưa điểm danh
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Danh sách học sinh */}
                <div className="md:w-1/4 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách học sinh</CardTitle>
                            <CardDescription>Chọn học sinh để xem lớp và điểm danh</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                {children.map((child) => (
                                    <button
                                        key={child.userId}
                                        className={`rounded-full px-5 py-2 font-semibold border transition-all duration-150 shadow-sm ${selectedStudentId === child.userId ? "bg-blue-700 text-white" : "bg-white text-gray-700 hover:bg-blue-50"}`}
                                        onClick={() => setSelectedStudentId(child.userId)}
                                    >
                                        {child.fullName || child.username}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Danh sách lớp */}
                <div className="md:w-1/4 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Danh sách lớp</CardTitle>
                            <CardDescription>Chọn lớp để xem điểm danh</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-3">
                                {classes.map((cls) => (
                                    <button
                                        key={cls.classId}
                                        className={`rounded-full px-5 py-2 font-semibold border transition-all duration-150 shadow-sm ${selectedClassId === cls.classId ? "bg-blue-700 text-white" : "bg-white text-gray-700 hover:bg-blue-50"}`}
                                        onClick={() => setSelectedClassId(cls.classId)}
                                    >
                                        {cls.className}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* Thông tin lớp và điểm danh */}
                <div className="md:w-2/4 w-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lớp: {classes.find(cls => cls.classId === selectedClassId)?.className || ''}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 space-y-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-500">Sĩ số:</div>
                                    <div className="font-semibold">{classes.find(cls => cls.classId === selectedClassId)?.size || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Phòng:</div>
                                    <div className="font-semibold">{classes.find(cls => cls.classId === selectedClassId)?.roomName || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Ngày bắt đầu:</div>
                                    <div className="font-semibold">{classes.find(cls => cls.classId === selectedClassId)?.startDate || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Thời gian học:</div>
                                    <div className="font-semibold">{classes.find(cls => cls.classId === selectedClassId) ? `${classes.find(cls => cls.classId === selectedClassId)?.startTime} - ${classes.find(cls => cls.classId === selectedClassId)?.endTime}` : '-'}</div>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="text-gray-500">Các ngày học:</div>
                                    <div className="font-semibold">{classes.find(cls => cls.classId === selectedClassId)?.daysOfWeek?.join(", ") || '-'}</div>
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center mb-6">
                                <div className="bg-blue-100 rounded-lg px-4 py-2 text-center">
                                    <div className="text-sm text-gray-500">Số buổi học</div>
                                    <div className="text-xl font-bold text-blue-700">{attendanceStats.total}</div>
                                </div>
                                <div className="bg-green-100 rounded-lg px-4 py-2 text-center">
                                    <div className="text-sm text-gray-500">Có mặt</div>
                                    <div className="text-xl font-bold text-green-700">{attendanceStats.present}</div>
                                </div>
                                <div className="bg-red-100 rounded-lg px-4 py-2 text-center">
                                    <div className="text-sm text-gray-500">Vắng mặt</div>
                                    <div className="text-xl font-bold text-red-700">{attendanceStats.absent}</div>
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold mb-2">Lịch sử điểm danh</div>
                                <Table className="rounded-lg border bg-white shadow mt-4">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center">Ngày</TableHead>
                                            <TableHead className="text-center">Trạng thái</TableHead>
                                            <TableHead className="text-center">Ghi chú</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceRecords.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-blue-50">
                                                <TableCell className="text-center">{record.date}</TableCell>
                                                <TableCell className="text-center">{getStatusBadge(record.status)}</TableCell>
                                                <TableCell className="text-center text-gray-400 italic">{record.note || "—"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 