import { useState, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import tuitionFeeApi from '@/api/tuitionFeeApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import { TuitionFeeResponse } from '@/types/tuitionfee';
import { PageResponse } from '@/types/api';
import { TablePagination } from '@/components/ui/table-pagination';

interface Fee extends TuitionFeeResponse {
    studentName: string;
    className: string;
    status: "paid" | "unpaid" | "overdue";
}

export default function AdminFees() {
    const [fees, setFees] = useState<Fee[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(6);
    const [isLoading, setIsLoading] = useState(false);

    const fetchFees = async (page: number) => {
        try {
            setIsLoading(true);
            const response = await tuitionFeeApi.getAll(page, pageSize);
            const content = response.data.result.content;
            const total = response.data.result.page.totalPages;
            const totalElements = response.data.result.page.totalElements;

            // Get unique student and class IDs
            const studentIds = [...new Set(content.map(fee => fee.studentId))];
            const classIds = [...new Set(content.map(fee => fee.classId))];

            // Fetch student and class details
            const [studentsResponse, classesResponse] = await Promise.all([
                studentApi.getByIds(studentIds),
                Promise.all(classIds.map(id => classApi.getById(id)))
            ]);

            const students = studentsResponse.data.result;
            const classes = classesResponse.map(res => res.data.result);

            // Create lookup maps
            const studentMap = new Map(students.map(student => [student.userId, student]));
            const classMap = new Map(classes.map(cls => [cls.classId, cls]));

            // Transform the data to include student name, class name and status
            const transformedFees = content.map(fee => ({
                ...fee,
                studentName: studentMap.get(fee.studentId)?.fullName || "Unknown Student",
                className: classMap.get(fee.classId)?.className || "Unknown Class",
                status: (fee.remainingAmount === 0 ? "paid" :
                    fee.remainingAmount === fee.amount ? "unpaid" :
                        fee.remainingAmount > 0 && fee.remainingAmount < fee.amount ? "unpaid" : "overdue") as "paid" | "unpaid" | "overdue"
            }));

            setFees(transformedFees);
            setTotalPages(total);
            setTotalItems(totalElements);
        } catch (error) {
            console.error('Error fetching fees:', error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách học phí",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFees(currentPage);
    }, [currentPage]);

    const handleDelete = async (id: string) => {
        try {
            await tuitionFeeApi.delete(id);
            toast({
                title: "Thành công",
                description: "Đã xóa học phí thành công"
            });
            fetchFees(currentPage);
        } catch (error) {
            console.error('Error deleting fee:', error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa học phí",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (feeData: Fee) => {
        setSelectedFee(feeData);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedFee) return;

        try {
            await tuitionFeeApi.update(selectedFee.tuitionFeeId, {
                studentId: selectedFee.studentId,
                classId: selectedFee.classId,
                yearMonth: selectedFee.yearMonth,
                amount: selectedFee.amount,
                remainingAmount: selectedFee.remainingAmount
            });

            toast({
                title: "Thành công",
                description: "Đã cập nhật học phí thành công"
            });
            setIsEditDialogOpen(false);
            fetchFees(currentPage);
        } catch (error) {
            console.error('Error updating fee:', error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật học phí",
                variant: "destructive"
            });
        }
    };

    const handleAdd = async () => {
        // TODO: Implement add functionality
        setIsAddDialogOpen(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status: Fee['status'], remainingAmount: number, amount: number) => {
        const statusConfig = {
            paid: { bg: "bg-green-100", text: "text-green-800", label: "Đã thanh toán" },
            unpaid: {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                label: remainingAmount < amount ? "Chưa thanh toán đủ" : "Chưa thanh toán"
            },
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
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex justify-between items-center mb-4">
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
                                <Label htmlFor="yearMonth" className="text-right">
                                    Tháng
                                </Label>
                                <Input id="yearMonth" type="month" className="col-span-3" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAdd}>Lưu</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 border rounded-lg overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Học viên</TableHead>
                            <TableHead>Lớp học</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Số tiền còn lại</TableHead>
                            <TableHead>Tháng</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : fees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                            fees.map((fee) => (
                                <TableRow key={fee.tuitionFeeId}>
                                    <TableCell>{fee.studentName}</TableCell>
                                    <TableCell>{fee.className}</TableCell>
                                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                                    <TableCell>{formatCurrency(fee.remainingAmount)}</TableCell>
                                    <TableCell>{fee.yearMonth}</TableCell>
                                    <TableCell>{getStatusBadge(fee.status, fee.remainingAmount, fee.amount)}</TableCell>
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
                                            onClick={() => handleDelete(fee.tuitionFeeId)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                itemLabel="học phí"
            />

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
                                    disabled
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-class" className="text-right">
                                    Lớp học
                                </Label>
                                <Input
                                    id="edit-class"
                                    defaultValue={selectedFee.className}
                                    className="col-span-3"
                                    disabled
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
                                <Label htmlFor="edit-remainingAmount" className="text-right">
                                    Số tiền còn lại
                                </Label>
                                <Input
                                    id="edit-remainingAmount"
                                    type="number"
                                    defaultValue={selectedFee.remainingAmount}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-yearMonth" className="text-right">
                                    Tháng
                                </Label>
                                <Input
                                    id="edit-yearMonth"
                                    type="month"
                                    defaultValue={selectedFee.yearMonth}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 