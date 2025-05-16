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
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    classes: number;
    status: "active" | "inactive";
}

const sampleTeachers: Teacher[] = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        phone: "0123456789",
        classes: 3,
        status: "active",
    },
    {
        id: "2",
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone: "0987654321",
        classes: 2,
        status: "active",
    },
];

export default function AdminTeachers() {
    const [teachers, setTeachers] = useState<Teacher[]>(sampleTeachers);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const handleDelete = (id: string) => {
        setTeachers(teachers.filter(t => t.id !== id));
    };

    const handleEdit = (teacherData: Teacher) => {
        setSelectedTeacher(teacherData);
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý giáo viên</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm giáo viên
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm giáo viên mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Họ và tên
                                </Label>
                                <Input id="name" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input id="email" type="email" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    Số điện thoại
                                </Label>
                                <Input id="phone" className="col-span-3" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={() => setIsAddDialogOpen(false)}>Lưu</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Số điện thoại</TableHead>
                            <TableHead>Số lớp</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell>{teacher.name}</TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>{teacher.phone}</TableCell>
                                <TableCell>{teacher.classes}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${teacher.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}>
                                        {teacher.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(teacher)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(teacher.id)}
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
                        <DialogTitle>Chỉnh sửa thông tin giáo viên</DialogTitle>
                    </DialogHeader>
                    {selectedTeacher && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Họ và tên
                                </Label>
                                <Input
                                    id="edit-name"
                                    defaultValue={selectedTeacher.name}
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
                                    defaultValue={selectedTeacher.email}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-phone" className="text-right">
                                    Số điện thoại
                                </Label>
                                <Input
                                    id="edit-phone"
                                    defaultValue={selectedTeacher.phone}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button onClick={() => setIsEditDialogOpen(false)}>Lưu thay đổi</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 