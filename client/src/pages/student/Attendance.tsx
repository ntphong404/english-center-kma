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

interface AttendanceRecord {
    id: string;
    date: string;
    className: string;
    status: "present" | "absent";
    note?: string;
}

const attendanceRecords: AttendanceRecord[] = [
    {
        id: "1",
        date: "01/04/2024",
        className: "Tiếng Anh Giao Tiếp A1",
        status: "present",
    },
    {
        id: "2",
        date: "03/04/2024",
        className: "Tiếng Anh Giao Tiếp A1",
        status: "present",
    },
    {
        id: "3",
        date: "05/04/2024",
        className: "Tiếng Anh Giao Tiếp A1",
        status: "absent",
        note: "Có phép",
    },
    {
        id: "4",
        date: "02/04/2024",
        className: "Ngữ Pháp Cơ Bản",
        status: "present",
    },
    {
        id: "5",
        date: "04/04/2024",
        className: "Ngữ Pháp Cơ Bản",
        status: "present",
    },
];

export default function StudentAttendance() {
    const getStatusBadge = (status: AttendanceRecord["status"]) => {
        switch (status) {
            case "present":
                return (
                    <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" /> Có mặt
                    </Badge>
                );
            case "late":
                return (
                    <Badge className="bg-yellow-500">
                        <Clock className="h-3 w-3 mr-1" /> Đi muộn
                    </Badge>
                );
            case "absent":
                return (
                    <Badge className="bg-red-500">
                        <X className="h-3 w-3 mr-1" /> Vắng mặt
                    </Badge>
                );
        }
    };

    const attendanceStats = {
        total: attendanceRecords.length,
        present: attendanceRecords.filter((record) => record.status === "present").length,
        late: attendanceRecords.filter((record) => record.status === "late").length,
        absent: attendanceRecords.filter((record) => record.status === "absent").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Điểm danh</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Tổng số buổi học
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceStats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Có mặt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {attendanceStats.present}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Đi muộn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                            {attendanceStats.late}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Vắng mặt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {attendanceStats.absent}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử điểm danh</CardTitle>
                    <CardDescription>
                        Xem lịch sử điểm danh của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Lớp học</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ghi chú</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attendanceRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.date}</TableCell>
                                    <TableCell>{record.className}</TableCell>
                                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                                    <TableCell>{record.note || "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 