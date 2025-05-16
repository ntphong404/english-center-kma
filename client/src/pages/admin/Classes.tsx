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

interface Class {
    id: string;
    name: string;
    teacher: string;
    students: number;
    schedule: string;
    status: "active" | "inactive";
}

const sampleClasses: Class[] = [
    {
        id: "1",
        name: "Lớp A1",
        teacher: "Nguyễn Văn A",
        students: 20,
        schedule: "Thứ 2, 4, 6 - 18:00-20:00",
        status: "active",
    },
    {
        id: "2",
        name: "Lớp B1",
        teacher: "Trần Thị B",
        students: 15,
        schedule: "Thứ 3, 5, 7 - 18:00-20:00",
        status: "active",
    },
];

export default function AdminClasses() {
    const [classes, setClasses] = useState<Class[]>(sampleClasses);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);

    const handleDelete = (id: string) => {
        setClasses(classes.filter(c => c.id !== id));
    };

    const handleEdit = (classData: Class) => {
        setSelectedClass(classData);
        setIsEditDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý lớp học</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm lớp học
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm lớp học mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Tên lớp
                                </Label>
                                <Input id="name" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="teacher" className="text-right">
                                    Giáo viên
                                </Label>
                                <Input id="teacher" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="schedule" className="text-right">
                                    Lịch học
                                </Label>
                                <Input id="schedule" className="col-span-3" />
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
                            <TableHead>Tên lớp</TableHead>
                            <TableHead>Giáo viên</TableHead>
                            <TableHead>Số học viên</TableHead>
                            <TableHead>Lịch học</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((classItem) => (
                            <TableRow key={classItem.id}>
                                <TableCell>{classItem.name}</TableCell>
                                <TableCell>{classItem.teacher}</TableCell>
                                <TableCell>{classItem.students}</TableCell>
                                <TableCell>{classItem.schedule}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${classItem.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}>
                                        {classItem.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(classItem)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(classItem.id)}
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
                        <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
                    </DialogHeader>
                    {selectedClass && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">
                                    Tên lớp
                                </Label>
                                <Input
                                    id="edit-name"
                                    defaultValue={selectedClass.name}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-teacher" className="text-right">
                                    Giáo viên
                                </Label>
                                <Input
                                    id="edit-teacher"
                                    defaultValue={selectedClass.teacher}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-schedule" className="text-right">
                                    Lịch học
                                </Label>
                                <Input
                                    id="edit-schedule"
                                    defaultValue={selectedClass.schedule}
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