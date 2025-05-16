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

interface Fee {
    id: string;
    studentName: string;
    class: string;
    amount: number;
    dueDate: string;
    status: "paid" | "unpaid" | "overdue";
}

const sampleFees: Fee[] = [
    {
        id: "1",
        studentName: "Lê Văn C",
        class: "Lớp A1",
        amount: 2000000,
        dueDate: "2024-03-15",
        status: "paid",
    },
    {
        id: "2",
        studentName: "Phạm Thị D",
        class: "Lớp B1",
        amount: 2000000,
        dueDate: "2024-03-20",
        status: "unpaid",
    },
];

export default function AdminFees() {
    const [fees, setFees] = useState<Fee[]>(sampleFees);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

    const handleDelete = (id: string) => {
        setFees(fees.filter(f => f.id !== id));
    };

    const handleEdit = (feeData: Fee) => {
        setSelectedFee(feeData);
        setIsEditDialogOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status: Fee['status']) => {
        const statusConfig = {
            paid: { bg: "bg-green-100", text: "text-green-800", label: "Đã thanh toán" },
            unpaid: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chưa thanh toán" },
            overdue: { bg: "bg-red-100", text: "text-red-800", label: "Quá hạn" },
        };
        const config = statusConfig[status];
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý học phí</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm học phí
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm học phí mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="student" className="text-right">
                                    Học viên
                                </Label>
                                <Input id="student" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="class" className="text-right">
                                    Lớp học
                                </Label>
                                <Input id="class" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Số tiền
                                </Label>
                                <Input id="amount" type="number" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dueDate" className="text-right">
                                    Hạn thanh toán
                                </Label>
                                <Input id="dueDate" type="date" className="col-span-3" />
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
                            <TableHead>Học viên</TableHead>
                            <TableHead>Lớp học</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Hạn thanh toán</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fees.map((fee) => (
                            <TableRow key={fee.id}>
                                <TableCell>{fee.studentName}</TableCell>
                                <TableCell>{fee.class}</TableCell>
                                <TableCell>{formatCurrency(fee.amount)}</TableCell>
                                <TableCell>{fee.dueDate}</TableCell>
                                <TableCell>{getStatusBadge(fee.status)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(fee)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(fee.id)}
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
                        <DialogTitle>Chỉnh sửa học phí</DialogTitle>
                    </DialogHeader>
                    {selectedFee && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-student" className="text-right">
                                    Học viên
                                </Label>
                                <Input
                                    id="edit-student"
                                    defaultValue={selectedFee.studentName}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-class" className="text-right">
                                    Lớp học
                                </Label>
                                <Input
                                    id="edit-class"
                                    defaultValue={selectedFee.class}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-amount" className="text-right">
                                    Số tiền
                                </Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    defaultValue={selectedFee.amount}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-dueDate" className="text-right">
                                    Hạn thanh toán
                                </Label>
                                <Input
                                    id="edit-dueDate"
                                    type="date"
                                    defaultValue={selectedFee.dueDate}
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