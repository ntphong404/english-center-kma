import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Check, X } from "lucide-react";

interface Student {
    id: string;
    name: string;
    status: "present" | "absent" | "late";
    note?: string;
}

interface Class {
    id: string;
    name: string;
    students: Student[];
}

const sampleClasses: Class[] = [
    {
        id: "1",
        name: "Lớp A1",
        students: [
            { id: "1", name: "Trần Văn B", status: "present" },
            { id: "2", name: "Lê Thị C", status: "late", note: "Đi muộn 15 phút" },
            { id: "3", name: "Phạm Văn D", status: "absent", note: "Có phép" },
        ],
    },
    {
        id: "2",
        name: "Lớp B2",
        students: [
            { id: "4", name: "Nguyễn Văn E", status: "present" },
            { id: "5", name: "Trần Thị F", status: "present" },
            { id: "6", name: "Lê Văn G", status: "absent" },
        ],
    },
];

export default function TeacherAttendance() {
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [attendance, setAttendance] = useState<Class[]>(sampleClasses);

    const handleStatusChange = (
        classId: string,
        studentId: string,
        status: Student["status"]
    ) => {
        setAttendance(
            attendance.map((cls) =>
                cls.id === classId
                    ? {
                        ...cls,
                        students: cls.students.map((student) =>
                            student.id === studentId
                                ? { ...student, status, note: "" }
                                : student
                        ),
                    }
                    : cls
            )
        );
    };

    const handleNoteChange = (
        classId: string,
        studentId: string,
        note: string
    ) => {
        setAttendance(
            attendance.map((cls) =>
                cls.id === classId
                    ? {
                        ...cls,
                        students: cls.students.map((student) =>
                            student.id === studentId ? { ...student, note } : student
                        ),
                    }
                    : cls
            )
        );
    };

    const selectedClassData = attendance.find((cls) => cls.id === selectedClass);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Điểm danh</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Chọn lớp và ngày</CardTitle>
                        <CardDescription>
                            Chọn lớp và ngày để điểm danh
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="class">Lớp học</Label>
                                <Select
                                    value={selectedClass}
                                    onValueChange={setSelectedClass}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn lớp học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {attendance.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Ngày điểm danh</Label>
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    locale={vi}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {selectedClassData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Điểm danh lớp {selectedClassData.name}</CardTitle>
                            <CardDescription>
                                Ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {selectedClassData.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="p-4 border rounded-lg space-y-2"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{student.name}</h3>
                                                {student.note && (
                                                    <p className="text-sm text-gray-500">{student.note}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={student.status === "present" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusChange(selectedClass, student.id, "present")
                                                    }
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant={student.status === "late" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusChange(selectedClass, student.id, "late")
                                                    }
                                                >
                                                    <span className="text-xs">Muộn</span>
                                                </Button>
                                                <Button
                                                    variant={student.status === "absent" ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() =>
                                                        handleStatusChange(selectedClass, student.id, "absent")
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {student.status !== "present" && (
                                            <div className="space-y-2">
                                                <Label htmlFor={`note-${student.id}`}>Ghi chú</Label>
                                                <Input
                                                    id={`note-${student.id}`}
                                                    value={student.note || ""}
                                                    onChange={(e) =>
                                                        handleNoteChange(
                                                            selectedClass,
                                                            student.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Nhập ghi chú (nếu có)"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 