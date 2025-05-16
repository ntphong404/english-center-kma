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

interface Class {
    id: string;
    name: string;
    students: number;
    schedule: string;
    level: string;
}

const sampleClasses: Class[] = [
    {
        id: "1",
        name: "Lớp A1",
        students: 20,
        schedule: "Thứ 2, 4, 6 - 18:00-20:00",
        level: "Beginner",
    },
    {
        id: "2",
        name: "Lớp B1",
        students: 15,
        schedule: "Thứ 3, 5, 7 - 18:00-20:00",
        level: "Intermediate",
    },
];

export default function TeacherClasses() {
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
                        {sampleClasses.map((classItem) => (
                            <TableRow key={classItem.id}>
                                <TableCell>{classItem.name}</TableCell>
                                <TableCell>{classItem.students}</TableCell>
                                <TableCell>{classItem.schedule}</TableCell>
                                <TableCell>{classItem.level}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 