import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    class: string;
    level: "beginner" | "intermediate" | "advanced";
    status: "active" | "inactive";
    joinDate: string;
}

const sampleStudents: Student[] = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0123456789",
        class: "Lớp A1",
        level: "beginner",
        status: "active",
        joinDate: "2024-01-15",
    },
    {
        id: "2",
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone: "0987654321",
        class: "Lớp B2",
        level: "intermediate",
        status: "active",
        joinDate: "2024-02-01",
    },
];

const levels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];

const classes = ["Lớp A1", "Lớp A2", "Lớp B1", "Lớp B2", "Lớp C1"];

export default function AdminStudents() {
    const [students, setStudents] = useState<Student[]>(sampleStudents);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [newStudent, setNewStudent] = useState<Partial<Student>>({
        name: "",
        email: "",
        phone: "",
        class: "",
        level: "beginner",
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
    });

    const handleAdd = () => {
        if (
            newStudent.name &&
            newStudent.email &&
            newStudent.phone &&
            newStudent.class &&
            newStudent.level &&
            newStudent.status &&
            newStudent.joinDate
        ) {
            const student: Student = {
                id: Date.now().toString(),
                name: newStudent.name,
                email: newStudent.email,
                phone: newStudent.phone,
                class: newStudent.class,
                level: newStudent.level as Student["level"],
                status: newStudent.status as Student["status"],
                joinDate: newStudent.joinDate,
            };
            setStudents([...students, student]);
            setIsAddDialogOpen(false);
            setNewStudent({
                name: "",
                email: "",
                phone: "",
                class: "",
                level: "beginner",
                status: "active",
                joinDate: new Date().toISOString().split('T')[0],
            });
        }
    };

    const handleEdit = (student: Student) => {
        setSelectedStudent(student);
        setIsEditDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        setStudents(students.filter((student) => student.id !== id));
    };

    const getStatusBadge = (status: Student["status"]) => {
        const statusConfig = {
            active: { bg: "bg-green-100", text: "text-green-800", label: "Đang học" },
            inactive: { bg: "bg-red-100", text: "text-red-800", label: "Ngừng học" },
        };
        const config = statusConfig[status];
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getLevelBadge = (level: Student["level"]) => {
        const levelConfig = {
            beginner: { bg: "bg-blue-100", text: "text-blue-800", label: "Beginner" },
            intermediate: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Intermediate" },
            advanced: { bg: "bg-purple-100", text: "text-purple-800", label: "Advanced" },
        };
        const config = levelConfig[level];
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý học viên</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm học viên
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm học viên mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Họ tên
                                </Label>
                                <Input
                                    id="name"
                                    value={newStudent.name}
                                    onChange={(e) =>
                                        setNewStudent({ ...newStudent, name: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newStudent.email}
                                    onChange={(e) =>
                                        setNewStudent({ ...newStudent, email: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    Số điện thoại
                                </Label>
                                <Input
                                    id="phone"
                                    value={newStudent.phone}
                                    onChange={(e) =>
                                        setNewStudent({ ...newStudent, phone: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="class" className="text-right">
                                    Lớp học
                                </Label>
                                <Select
                                    value={newStudent.class}
                                    onValueChange={(value) =>
                                        setNewStudent({ ...newStudent, class: value })
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn lớp học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls} value={cls}>
                                                {cls}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="level" className="text-right">
                                    Trình độ
                                </Label>
                                <Select
                                    value={newStudent.level}
                                    onValueChange={(value) =>
                                        setNewStudent({ ...newStudent, level: value as Student["level"] })
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn trình độ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="joinDate" className="text-right">
                                    Ngày nhập học
                                </Label>
                                <Input
                                    id="joinDate"
                                    type="date"
                                    value={newStudent.joinDate}
                                    onChange={(e) =>
                                        setNewStudent({ ...newStudent, joinDate: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAdd}>Thêm học viên</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Họ tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead>Lớp học</TableHead>
                            <TableHead>Trình độ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ngày nhập học</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.phone}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell>{getLevelBadge(student.level)}</TableCell>
                                <TableCell>{getStatusBadge(student.status)}</TableCell>
                                <TableCell>{student.joinDate}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(student)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(student.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thông tin học viên</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Họ tên
                                </Label>
                                <Input
                                    id="edit-name"
                                    defaultValue={selectedStudent.name}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    defaultValue={selectedStudent.email}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-phone" className="text-right">
                                    Số điện thoại
                                </Label>
                                <Input
                                    id="edit-phone"
                                    defaultValue={selectedStudent.phone}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-class" className="text-right">
                                    Lớp học
                                </Label>
                                <Select defaultValue={selectedStudent.class}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn lớp học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls} value={cls}>
                                                {cls}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-level" className="text-right">
                                    Trình độ
                                </Label>
                                <Select defaultValue={selectedStudent.level}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn trình độ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-status" className="text-right">
                                    Trạng thái
                                </Label>
                                <Select defaultValue={selectedStudent.status}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Đang học</SelectItem>
                                        <SelectItem value="inactive">Ngừng học</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button onClick={() => setIsEditDialogOpen(false)}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 