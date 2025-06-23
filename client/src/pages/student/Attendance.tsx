import React, { useState, useEffect } from "react";
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
import { classApi } from '@/api/classApi';
import attendanceApi from '@/api/attendanceApi';
import { getUser } from '@/store/userStore';
import { ClassResponse } from '@/types/entityclass';
import { AttendanceResponse, type StudentAttendance } from '@/types/attendance';
import { useToast } from '@/components/ui/use-toast';

interface FlatAttendanceRecord extends StudentAttendance {
    date: string;
    attendanceId: string;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "PRESENT":
            return (
                <Badge className="bg-green-500 hover:bg-green-600">
                    <Check className="h-3 w-3 mr-1" /> Có mặt
                </Badge>
            );
        case "ABSENT":
            return (
                <Badge variant="destructive">
                    <X className="h-3 w-3 mr-1" /> Vắng mặt
                </Badge>
            );
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export default function StudentAttendance() {
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<FlatAttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(false);
    const { toast } = useToast();
    const studentId = getUser()?.userId;

    useEffect(() => {
        const fetchClasses = async () => {
            if (!studentId) return;
            setClassesLoading(true);
            try {
                const res = await classApi.getAll(undefined, undefined, studentId, undefined, 0, 100);
                const classList = res.data.result.content;
                setClasses(classList);
                if (classList.length > 0) {
                    setSelectedClassId(classList[0].classId);
                }
            } catch (error) {
                toast({ title: 'Lỗi', description: 'Không thể tải danh sách lớp', variant: 'destructive' });
            } finally {
                setClassesLoading(false);
            }
        };
        fetchClasses();
    }, [studentId, toast]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedClassId) return;
            setLoading(true);
            try {
                const res = await attendanceApi.getAll(undefined, selectedClassId, undefined, 0, 100);
                let allAttendances: any[] = [];
                const result = res.data.result;
                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                    allAttendances = result.content;
                } else if (Array.isArray(result)) {
                    allAttendances = result;
                }
                const studentAttendanceHistory: FlatAttendanceRecord[] = [];

                allAttendances.forEach(classSession => {
                    const studentRecord = classSession.studentAttendances.find(
                        att => att.studentId === studentId
                    );
                    if (studentRecord) {
                        studentAttendanceHistory.push({
                            ...studentRecord,
                            date: classSession.date,
                            attendanceId: classSession.attendanceId,
                        });
                    }
                });

                setAttendanceRecords(studentAttendanceHistory.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ));
            } catch (error) {
                toast({ title: 'Lỗi', description: 'Không thể tải lịch sử điểm danh', variant: 'destructive' });
                setAttendanceRecords([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [selectedClassId, studentId, toast]);

    const selectedClass = classes.find((cls) => cls.classId === selectedClassId);

    const attendanceStats = {
        total: attendanceRecords.length,
        present: attendanceRecords.filter((r) => r.status === "PRESENT").length,
        absent: attendanceRecords.filter((r) => r.status === "ABSENT").length,
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5);
    };

    if (classesLoading) {
        return <div>Đang tải...</div>;
    }

    if (classes.length === 0) {
        return <div>Bạn chưa tham gia lớp học nào.</div>;
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Danh sách lớp */}
            <div className="md:w-1/4 w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách lớp</CardTitle>
                        <CardDescription>Chọn lớp để xem thông tin và điểm danh</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            {classes.map((cls) => (
                                <button
                                    key={cls.classId}
                                    className={`rounded-lg px-4 py-2 text-left border ${selectedClassId === cls.classId ? "bg-primary text-white" : "bg-white text-black"}`}
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
            <div className="md:w-3/4 w-full">
                {selectedClass ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lớp: {selectedClass.className}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 space-y-1">
                                <div>Sĩ số: {selectedClass.studentIds?.length || 0}</div>
                                <div>Phòng: {selectedClass.roomName}</div>
                                <div>Ngày bắt đầu: {formatDate(selectedClass.startDate)}</div>
                                <div>Thời gian học: {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)}</div>
                                <div>Các ngày học: {selectedClass.daysOfWeek?.join(", ") || ""}</div>
                            </div>
                            <div className="flex gap-6 mb-6">
                                <div className="font-medium">Số buổi học: <span className="text-primary font-bold">{attendanceStats.total}</span></div>
                                <div className="font-medium">Có mặt: <span className="text-green-600 font-bold">{attendanceStats.present}</span></div>
                                <div className="font-medium">Vắng mặt: <span className="text-red-600 font-bold">{attendanceStats.absent}</span></div>
                            </div>
                            <div>
                                <div className="font-semibold mb-2">Lịch sử điểm danh</div>
                                {loading ? (
                                    <div>Đang tải...</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Ngày</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Ghi chú</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendanceRecords.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center">
                                                        Chưa có dữ liệu điểm danh
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                attendanceRecords.map((record) => (
                                                    <TableRow key={`${record.attendanceId}-${record.studentId}`}>
                                                        <TableCell>{formatDate(record.date)}</TableCell>
                                                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                                                        <TableCell>{record.note || "-"}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div>Vui lòng chọn một lớp học.</div>
                )}
            </div>
        </div>
    );
} 