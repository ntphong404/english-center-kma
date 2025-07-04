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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, CreditCard, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import tuitionFeeApi from '@/api/tuitionFeeApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import { TuitionFeeResponse } from '@/types/tuitionfee';
import { PageResponse } from '@/types/api';
import { TablePagination } from '@/components/ui/table-pagination';
import { teacherPaymentApi } from '@/api/teacherPaymentApi';
import { TeacherPaymentResponse, CreateTeacherPaymentRequest } from '@/types/teacherpayment';
import teacherApi from '@/api/teacherApi';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '@/components/ui/select';
import ColoredTable from '@/components/ui/ColoredTable';
import CustomDialog from '@/components/CustomDialog';
import paymentApi from '@/api/paymentApi';

interface Fee extends TuitionFeeResponse {
    studentName: string;
    className: string;
    status: "paid" | "unpaid" | "overdue";
}

interface Teacher {
    userId: string;
    fullName?: string;
    username?: string;
    salary?: number;
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
    const [activeTab, setActiveTab] = useState<'fees' | 'teacherPayments'>('fees');
    const [teacherPayments, setTeacherPayments] = useState<TeacherPaymentResponse[]>([]);
    const [teacherPaymentPage, setTeacherPaymentPage] = useState(0);
    const [teacherPaymentTotalPages, setTeacherPaymentTotalPages] = useState(0);
    const [teacherPaymentTotalItems, setTeacherPaymentTotalItems] = useState(0);
    const [teacherPaymentLoading, setTeacherPaymentLoading] = useState(false);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [teacherPaymentsByMonth, setTeacherPaymentsByMonth] = useState<TeacherPaymentResponse[]>([]);
    const [teacherPaymentsLoading, setTeacherPaymentsLoading] = useState(false);
    const [teacherPaymentsPage, setTeacherPaymentsPage] = useState(0);
    const [teacherPaymentsPageSize] = useState(6);
    const [teacherPaymentsTotalItems, setTeacherPaymentsTotalItems] = useState(0);
    const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
    const [selectedTeacherPayment, setSelectedTeacherPayment] = useState<TeacherPaymentResponse | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<TeacherPaymentResponse[]>([]);
    const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
    const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
    const [payDialogData, setPayDialogData] = useState<TeacherPaymentResponse | null>(null);
    const [payAmount, setPayAmount] = useState('');
    const [payError, setPayError] = useState('');
    const [allTeacherPayments, setAllTeacherPayments] = useState<TeacherPaymentResponse[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [feeToDelete, setFeeToDelete] = useState<Fee | null>(null);
    const [isFeePaymentHistoryDialogOpen, setIsFeePaymentHistoryDialogOpen] = useState(false);
    const [feePaymentHistory, setFeePaymentHistory] = useState<any[]>([]);
    const [feePaymentHistoryLoading, setFeePaymentHistoryLoading] = useState(false);

    const fetchFees = async (page: number) => {
        try {
            setIsLoading(true);
            const response = await tuitionFeeApi.getAll(undefined, undefined, page, pageSize);
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

    const fetchTeacherPayments = async (page: number) => {
        try {
            setTeacherPaymentLoading(true);
            const response = await teacherPaymentApi.getAll(undefined, undefined, undefined, page, pageSize);
            const content = response.data.result.content;
            const total = response.data.result.page.totalPages;
            const totalElements = response.data.result.page.totalElements;
            setTeacherPayments(content);
            setTeacherPaymentTotalPages(total);
            setTeacherPaymentTotalItems(totalElements);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách lương giáo viên",
                variant: "destructive"
            });
        } finally {
            setTeacherPaymentLoading(false);
        }
    };

    // Helper: get all months between two dates (inclusive)
    function getMonthYearRange(startYear: number, startMonth: number, endYear: number, endMonth: number) {
        const result: { month: number; year: number }[] = [];
        let y = startYear, m = startMonth;
        while (y < endYear || (y === endYear && m <= endMonth)) {
            result.push({ month: m, year: y });
            m++;
            if (m > 12) { m = 1; y++; }
        }
        return result;
    }

    // Fetch all teachers and set default teacher (with oldest payment record)
    useEffect(() => {
        if (activeTab !== 'teacherPayments') return;
        async function fetchTeachersAndDefault() {
            setTeacherPaymentsLoading(true);
            try {
                const res = await teacherApi.getAll(undefined, undefined, 0, 100, 'userId,ASC');
                const teacherList = res.data.result.content;
                setTeachers(teacherList);
                // Find teacher with oldest payment record
                let oldest: { teacher: Teacher, payment: TeacherPaymentResponse } | null = null;
                for (const teacher of teacherList) {
                    const payRes = await teacherPaymentApi.getAll(teacher.userId, undefined, undefined, 0, 1, 'createdAt,asc');
                    const payment = payRes.data.result.content[0];
                    if (payment) {
                        if (!oldest || new Date(payment.createdAt) < new Date(oldest.payment.createdAt)) {
                            oldest = { teacher, payment };
                        }
                    }
                }
                if (oldest) setSelectedTeacher(oldest.teacher);
                else if (teacherList.length > 0) setSelectedTeacher(teacherList[0]);
            } catch (e) {
                toast({ title: 'Lỗi', description: 'Không thể tải danh sách giáo viên', variant: 'destructive' });
            } finally {
                setTeacherPaymentsLoading(false);
            }
        }
        fetchTeachersAndDefault();
    }, [activeTab]);

    // Refactor fetchPayments to be callable from both useEffect and after payment
    const fetchTeacherPaymentsForSelected = async () => {
        if (!selectedTeacher) return;
        setTeacherPaymentsLoading(true);
        try {
            const oldestRes = await teacherPaymentApi.getAll(selectedTeacher.userId, undefined, undefined, 0, 1, 'createdAt,asc');
            const oldest = oldestRes.data.result.content[0];
            if (!oldest) {
                setAllTeacherPayments([]);
                setTeacherPaymentsTotalItems(0);
                setTeacherPaymentsByMonth([]);
                setTeacherPaymentsLoading(false);
                return;
            }
            const now = new Date();
            const months = getMonthYearRange(
                oldest.year,
                oldest.month,
                now.getFullYear(),
                now.getMonth() + 1
            );
            const paymentPromises = months.map(async ({ month, year }) => {
                const payRes = await teacherPaymentApi.getAll(selectedTeacher.userId, month, year, 0, 1, 'createdAt,desc');
                if (payRes.data.result.content.length > 0) {
                    return payRes.data.result.content[0];
                } else {
                    const newPaymentRequest: CreateTeacherPaymentRequest = {
                        teacherId: selectedTeacher.userId,
                        month: month,
                        year: year,
                        amount: selectedTeacher.salary || 0,
                        paidAmount: 0,
                        note: `Lương tháng ${month}`
                    };
                    try {
                        const createRes = await teacherPaymentApi.create(newPaymentRequest);
                        return createRes.data.result;
                    } catch (error) {
                        console.error('Error creating payment record:', error);
                        return null;
                    }
                }
            });
            const allPayments = (await Promise.all(paymentPromises)).filter(Boolean) as TeacherPaymentResponse[];
            allPayments.reverse();
            setAllTeacherPayments(allPayments);
            setTeacherPaymentsTotalItems(allPayments.length);
            setTeacherPaymentsByMonth(allPayments.slice(0, teacherPaymentsPageSize));
        } catch (e) {
            toast({ title: 'Lỗi', description: 'Không thể tải lương giáo viên', variant: 'destructive' });
            setAllTeacherPayments([]);
            setTeacherPaymentsTotalItems(0);
            setTeacherPaymentsByMonth([]);
        } finally {
            setTeacherPaymentsLoading(false);
        }
    };

    // Replace fetchPayments in useEffect with fetchTeacherPaymentsForSelected
    useEffect(() => {
        if (activeTab !== 'teacherPayments' || !selectedTeacher) return;
        fetchTeacherPaymentsForSelected();
        setTeacherPaymentsPage(0);
    }, [activeTab, selectedTeacher]);

    // When page changes, just slice from allTeacherPayments
    useEffect(() => {
        if (activeTab !== 'teacherPayments') return;
        const startIndex = teacherPaymentsPage * teacherPaymentsPageSize;
        const endIndex = startIndex + teacherPaymentsPageSize;
        setTeacherPaymentsByMonth(allTeacherPayments.slice(startIndex, endIndex));
    }, [teacherPaymentsPage, allTeacherPayments, activeTab]);

    useEffect(() => {
        if (activeTab === 'fees') fetchFees(currentPage);
        else fetchTeacherPayments(teacherPaymentPage);
    }, [activeTab, currentPage, teacherPaymentPage]);

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
            await tuitionFeeApi.patch(selectedFee.tuitionFeeId, {
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

    const handleViewPaymentHistory = async (teacherId: string, month: number, year: number) => {
        setPaymentHistoryLoading(true);
        try {
            const response = await teacherPaymentApi.getAll(teacherId, month, year, 0, 100, 'createdAt,desc');
            setPaymentHistory(response.data.result.content);
            setIsPaymentHistoryDialogOpen(true);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải lịch sử thanh toán",
                variant: "destructive"
            });
        } finally {
            setPaymentHistoryLoading(false);
        }
    };

    const handleViewFeePaymentHistory = async (studentId: string, classId: string) => {
        setFeePaymentHistoryLoading(true);
        try {
            const res = await paymentApi.getAll(studentId, classId, 0, 100);
            setFeePaymentHistory(res.data.result.content);
            setIsFeePaymentHistoryDialogOpen(true);
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể tải lịch sử thanh toán học phí', variant: 'destructive' });
        } finally {
            setFeePaymentHistoryLoading(false);
        }
    };

    // Listen for refresh event
    useEffect(() => {
        const handleRefresh = () => {
            if (activeTab === 'teacherPayments' && selectedTeacher) {
                // Trigger re-fetch
                const event = new Event('refreshTeacherPayments');
                window.dispatchEvent(event);
            }
        };
        window.addEventListener('refreshTeacherPayments', handleRefresh);
        return () => window.removeEventListener('refreshTeacherPayments', handleRefresh);
    }, [activeTab, selectedTeacher]);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-6 mb-20">
            <div className="mb-4">
                <h2 className="text-2xl font-bold">Quản lý học phí</h2>
            </div>
            <div className="flex gap-2 mb-4">
                <Button variant={activeTab === 'fees' ? 'default' : 'outline'} onClick={() => setActiveTab('fees')}>Học phí</Button>
                <Button variant={activeTab === 'teacherPayments' ? 'default' : 'outline'} onClick={() => setActiveTab('teacherPayments')}>Lương giáo viên</Button>
            </div>
            {activeTab === 'fees' && (
                <div className="flex justify-end items-center mb-4">
                    {/* Removed Add Fee Button */}
                </div>
            )}

            {activeTab === 'fees' && (
                <div className="flex-1 border rounded-lg">
                    <ColoredTable
                        columns={[
                            { title: 'Học viên' },
                            { title: 'Lớp học' },
                            { title: 'Số tiền' },
                            { title: 'Số tiền còn lại' },
                            { title: 'Tháng' },
                            { title: 'Trạng thái' },
                            { title: 'Thao tác', headerClassName: 'text-right' },
                        ]}
                        data={fees}
                        renderRow={(fee) => [
                            fee.studentName,
                            fee.className,
                            formatCurrency(fee.amount),
                            formatCurrency(fee.remainingAmount),
                            fee.yearMonth,
                            getStatusBadge(fee.status, fee.remainingAmount, fee.amount),
                            <div className="text-right flex gap-1 justify-end" key="actions">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(fee)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => { setFeeToDelete(fee); setIsDeleteDialogOpen(true); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleViewFeePaymentHistory(fee.studentId, fee.classId)} title="Xem lịch sử thanh toán">
                                    <History className="h-4 w-4" />
                                </Button>
                            </div>
                        ]}
                        pageSize={pageSize}
                        emptyMessage={isLoading ? 'Đang tải...' : 'Không có dữ liệu'}
                    />
                </div>
            )}

            {activeTab === 'teacherPayments' && (
                <div className="mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span>Chọn giáo viên:</span>
                        <Select value={selectedTeacher?.userId || ''} onValueChange={val => {
                            const t = teachers.find(t => t.userId === val);
                            if (t) setSelectedTeacher(t);
                        }}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Chọn giáo viên" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map(t => (
                                    <SelectItem key={t.userId} value={t.userId}>{t.fullName || t.username}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedTeacher && (
                        <div className="text-lg font-semibold">Giáo viên: {selectedTeacher.fullName || selectedTeacher.username}</div>
                    )}
                </div>
            )}

            {activeTab === 'teacherPayments' && (
                <div className="border rounded-lg">
                    <ColoredTable
                        columns={[
                            { title: 'Tên giáo viên' },
                            { title: 'Tháng' },
                            { title: 'Năm' },
                            { title: 'Tổng lương' },
                            { title: 'Số tiền còn lại' },
                            { title: 'Ghi chú' },
                            { title: 'Trạng thái' },
                            { title: 'Thao tác', headerClassName: 'text-right' },
                        ]}
                        data={teacherPaymentsByMonth}
                        renderRow={(tp) => [
                            tp.teacherName,
                            tp.month,
                            tp.year,
                            formatCurrency(tp.amount),
                            formatCurrency(tp.remainingAmount),
                            tp.note,
                            <span className={`px-2 py-1 rounded-full text-xs ${tp.status === 'PAID' ? 'bg-green-100 text-green-800' : tp.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{tp.status === 'PAID' ? 'Đã thanh toán' : tp.status === 'PARTIALLY_PAID' ? 'Chưa thanh toán đủ' : 'Chưa thanh toán'}</span>,
                            <div className="text-right" key="actions">
                                {(tp.status === 'UNPAID' || tp.status === 'PARTIALLY_PAID') && (
                                    <Button variant="ghost" size="icon" onClick={() => { setPayDialogData(tp); setPayAmount(''); setPayError(''); setIsPayDialogOpen(true); }} title="Thanh toán">
                                        <CreditCard className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleViewPaymentHistory(tp.teacherId, tp.month, tp.year)} title="Xem lịch sử thanh toán">
                                    <History className="h-4 w-4" />
                                </Button>
                            </div>
                        ]}
                        pageSize={teacherPaymentsPageSize}
                        emptyMessage={teacherPaymentsLoading ? 'Đang tải...' : 'Không có dữ liệu'}
                    />
                </div>
            )}

            {activeTab === 'fees' && (
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    itemLabel="học phí"
                />
            )}
            {activeTab === 'teacherPayments' && (
                <TablePagination
                    currentPage={teacherPaymentsPage}
                    totalPages={Math.ceil(teacherPaymentsTotalItems / teacherPaymentsPageSize)}
                    totalItems={teacherPaymentsTotalItems}
                    onPageChange={setTeacherPaymentsPage}
                    itemLabel="lương giáo viên"
                />
            )}

            <CustomDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} title="Chỉnh sửa học phí">
                {selectedFee && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-student" className="text-right">Học viên</Label>
                            <Input id="edit-student" defaultValue={selectedFee.studentName} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-class" className="text-right">Lớp học</Label>
                            <Input id="edit-class" defaultValue={selectedFee.className} className="col-span-3" disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-amount" className="text-right">Số tiền</Label>
                            <Input id="edit-amount" type="number" defaultValue={selectedFee.amount} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-remainingAmount" className="text-right">Số tiền còn lại</Label>
                            <Input id="edit-remainingAmount" type="number" defaultValue={selectedFee.remainingAmount} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-yearMonth" className="text-right">Tháng</Label>
                            <Input id="edit-yearMonth" type="month" defaultValue={selectedFee.yearMonth} className="col-span-3" />
                        </div>
                    </div>
                )}
                <div className="flex justify-end">
                    <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
                </div>
            </CustomDialog>

            <CustomDialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen} title="Thanh toán lương giáo viên">
                {payDialogData && (
                    <form className="grid gap-6 py-4" onSubmit={async (e) => {
                        e.preventDefault();
                        setPayError('');
                        const remain = payDialogData.remainingAmount;
                        const paid = parseFloat(payAmount);
                        if (isNaN(paid) || paid <= 0) {
                            setPayError('Vui lòng nhập số tiền hợp lệ');
                            return;
                        }
                        if (paid > remain) {
                            setPayError('Số tiền thanh toán không được lớn hơn số tiền còn lại');
                            return;
                        }
                        try {
                            const req: CreateTeacherPaymentRequest = {
                                teacherId: payDialogData.teacherId,
                                month: payDialogData.month,
                                year: payDialogData.year,
                                amount: payDialogData.amount,
                                paidAmount: paid,
                                note: payDialogData.note || ''
                            };
                            await teacherPaymentApi.create(req);
                            toast({ title: 'Thành công', description: 'Đã thanh toán lương!' });
                            setIsPayDialogOpen(false);
                            // Refresh data
                            await fetchTeacherPaymentsForSelected();
                        } catch (error) {
                            setPayError('Có lỗi khi thanh toán!');
                        }
                    }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm">Giáo viên</Label>
                                <Input value={payDialogData.teacherName} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Tháng</Label>
                                <Input value={payDialogData.month} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Năm</Label>
                                <Input value={payDialogData.year} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Tổng lương</Label>
                                <Input value={formatCurrency(payDialogData.amount)} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm">Số tiền còn lại</Label>
                                <Input value={formatCurrency(payDialogData.remainingAmount)} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payAmount" className="text-sm">Số tiền thanh toán</Label>
                                <Input id="payAmount" name="payAmount" type="number" min={1} max={payDialogData.remainingAmount} value={payAmount} onChange={e => setPayAmount(e.target.value)} required />
                            </div>
                        </div>
                        {payError && <div className="text-red-500 text-sm mt-2">{payError}</div>}
                        <div className="flex justify-end gap-2 mt-4">
                            <Button type="submit">Thanh toán</Button>
                        </div>
                    </form>
                )}
            </CustomDialog>

            <CustomDialog open={isPaymentHistoryDialogOpen} onOpenChange={setIsPaymentHistoryDialogOpen} title="Lịch sử thanh toán">
                <div className="max-h-96 overflow-auto">
                    {paymentHistoryLoading ? (
                        <div className="text-center py-4">Đang tải...</div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="text-center py-4">Không có lịch sử thanh toán</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>Số tiền</TableHead>
                                    <TableHead>Đã thanh toán</TableHead>
                                    <TableHead>Còn lại</TableHead>
                                    <TableHead>Ghi chú</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentHistory.map((payment, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{new Date(payment.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                        <TableCell>{formatCurrency(payment.paidAmount)}</TableCell>
                                        <TableCell>{formatCurrency(payment.remainingAmount)}</TableCell>
                                        <TableCell>{payment.note}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : payment.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{payment.status === 'PAID' ? 'Đã thanh toán' : payment.status === 'PARTIALLY_PAID' ? 'Chưa thanh toán đủ' : 'Chưa thanh toán'}</span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </CustomDialog>

            <CustomDialog open={isFeePaymentHistoryDialogOpen} onOpenChange={setIsFeePaymentHistoryDialogOpen} title="Lịch sử thanh toán học phí">
                <div className="max-h-96 overflow-auto border rounded-lg">
                    {feePaymentHistoryLoading ? (
                        <div className="text-center py-4">Đang tải...</div>
                    ) : feePaymentHistory.length === 0 ? (
                        <div className="text-center py-4">Không có lịch sử thanh toán</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead>Số tiền</TableHead>
                                    <TableHead>Đã thanh toán</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feePaymentHistory.map((payment, idx) => {
                                    const amount = payment.tuitionFee?.amount || 0;
                                    const remaining = payment.tuitionFee?.remainingAmount || 0;
                                    let statusLabel = 'Chưa thanh toán';
                                    let statusClass = 'bg-red-100 text-red-800';
                                    if (remaining === 0) {
                                        statusLabel = 'Đã thanh toán';
                                        statusClass = 'bg-green-100 text-green-800';
                                    } else if (remaining < amount) {
                                        statusLabel = 'Đã thanh toán một phần';
                                        statusClass = 'bg-yellow-100 text-yellow-800';
                                    }
                                    return (
                                        <TableRow key={idx}>
                                            <TableCell>{new Date(payment.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                            <TableCell>{formatCurrency(amount)}</TableCell>
                                            <TableCell>{formatCurrency(payment.paidAmount)}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>{statusLabel}</span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </CustomDialog>

            <CustomDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Xác nhận xóa học phí">
                <div>Bạn có chắc muốn xóa học phí của <b>{feeToDelete?.studentName}</b> lớp <b>{feeToDelete?.className}</b> tháng <b>{feeToDelete?.yearMonth}</b> không?</div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                    <Button variant="destructive" onClick={() => { if (feeToDelete) { handleDelete(feeToDelete.tuitionFeeId); setIsDeleteDialogOpen(false); setFeeToDelete(null); } }}>Xóa</Button>
                </div>
            </CustomDialog>
        </div>
    );
} 