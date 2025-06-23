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

// Mock data danh sách lớp học của học sinh
const classes = [
    {
        id: "class1",
        name: "Tiếng Anh 3B",
        size: 12,
        room: "TA1-201",
        startDate: "10/06/2025",
        time: "07:30:00 - 09:30:00",
        days: ["Monday", "Wednesday"],
    },
    {
        id: "class2",
        name: "Tiếng Anh 4B",
        size: 10,
        room: "TA1-202",
        startDate: "12/06/2025",
        time: "09:30:00 - 11:30:00",
        days: ["Tuesday", "Thursday"],
    },
    {
        id: "class3",
        name: "Tiếng Anh 5A",
        size: 15,
        room: "TA1-301",
        startDate: "15/06/2025",
        time: "13:00:00 - 15:00:00",
        days: ["Friday", "Sunday"],
    },
    {
        id: "class4",
        name: "Tiếng Anh 5C",
        size: 10,
        room: "TA1-403",
        startDate: "17/06/2025",
        time: "07:30:00 - 09:30:00",
        days: ["Tuesday", "Friday", "Sunday"],
    },
];

// Mock data điểm danh theo từng lớp
const attendanceByClass: Record<string, any[]> = {
    class1: [
        { id: "1", date: "01/06/2025", status: "present" },
        { id: "2", date: "03/06/2025", status: "absent", note: "Có phép" },
        { id: "3", date: "05/06/2025", status: "present" },
    ],
    class2: [
        { id: "1", date: "02/06/2025", status: "present" },
        { id: "2", date: "04/06/2025", status: "present" },
    ],
    class3: [
        { id: "1", date: "01/06/2025", status: "present" },
        { id: "2", date: "03/06/2025", status: "present" },
        { id: "3", date: "05/06/2025", status: "absent" },
    ],
    class4: [
        { id: "1", date: "10/06/2025", status: "present" },
        { id: "2", date: "12/06/2025", status: "present" },
        { id: "3", date: "14/06/2025", status: "absent", note: "Nghỉ ốm" },
        { id: "4", date: "16/06/2025", status: "present" },
    ],
};

export default function StudentAttendance() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Student[]>([]);
    const [selectedClassId, setSelectedClassId] = useState(classes[0].id);
    const selectedClass = classes.find((cls) => cls.id === selectedClassId)!;
    const attendanceRecords = attendanceByClass[selectedClassId] || [];

    const attendanceStats = {
        total: attendanceRecords.length,
        present: attendanceRecords.filter((r) => r.status === "present").length,
        absent: attendanceRecords.filter((r) => r.status === "absent").length,
    };

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "present":
                return (
                    <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" /> Có mặt
                    </Badge>
                );
            case "absent":
                return (
                    <Badge className="bg-red-500">
                        <X className="h-3 w-3 mr-1" /> Vắng mặt
                    </Badge>
                );
            default:
                return null;
        }
    };

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
                                    key={cls.id}
                                    className={`rounded-lg px-4 py-2 text-left border ${selectedClassId === cls.id ? "bg-primary text-white" : "bg-white text-black"}`}
                                    onClick={() => setSelectedClassId(cls.id)}
                                >
                                    {cls.name}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Thông tin lớp và điểm danh */}
            <div className="md:w-3/4 w-full">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin lớp: {selectedClass.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 space-y-1">
                            <div>Sĩ số: {selectedClass.size}</div>
                            <div>Phòng: {selectedClass.room}</div>
                            <div>Ngày bắt đầu: {selectedClass.startDate}</div>
                            <div>Thời gian học: {selectedClass.time}</div>
                            <div>Các ngày học: {selectedClass.days.join(", ")}</div>
                        </div>
                        <div className="flex gap-6 mb-6">
                            <div className="font-medium">Số buổi học: <span className="text-primary font-bold">{attendanceStats.total}</span></div>
                            <div className="font-medium">Có mặt: <span className="text-green-600 font-bold">{attendanceStats.present}</span></div>
                            <div className="font-medium">Vắng mặt: <span className="text-red-600 font-bold">{attendanceStats.absent}</span></div>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Lịch sử điểm danh</div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ngày</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceRecords.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell>{record.date}</TableCell>
                                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                                            <TableCell>{record.note || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 