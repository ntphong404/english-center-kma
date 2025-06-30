import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, AlertCircle, DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import tuitionFeeApi from '@/api/tuitionFeeApi';
import paymentApi from '@/api/paymentApi';
import { Student } from '@/types/user';
import { TuitionFeeResponse } from '@/types/tuitionfee';
import { ClassResponse } from '@/types/entityclass';
import { PageResponse } from '@/types/api';
import { PaymentCreateRequest } from '@/types/payment';
import { TablePagination } from '@/components/ui/table-pagination';

interface EnhancedTuitionFee extends TuitionFeeResponse {
    className?: string;
    studentName?: string;
}

interface ChildFeeSummary {
    totalUnpaid: number;
    unpaidMonths: number;
    totalPaidAmount: number;
    fees: EnhancedTuitionFee[];
}

export default function ParentFees() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Student[]>([]);
    const [tuitionFees, setTuitionFees] = useState<Record<string, EnhancedTuitionFee[]>>({});
    const [classes, setClasses] = useState<Record<string, ClassResponse>>({});
    const [feeSummaries, setFeeSummaries] = useState<Record<string, ChildFeeSummary>>({});
    const [selectedMonths, setSelectedMonths] = useState<Record<string, string>>({});
    const [selectedYears, setSelectedYears] = useState<Record<string, string>>({});
    const [availableMonths, setAvailableMonths] = useState<Record<string, string[]>>({});

    // Payment dialog states
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<TuitionFeeResponse | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Helper for years
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (2020 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const monthLabels = months.map((m, i) => `Tháng ${i + 1}`);

    const [pages, setPages] = useState<Record<string, number>>({}); // current page per student
    const [totalPages, setTotalPages] = useState<Record<string, number>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            // Lấy danh sách học sinh của phụ huynh
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

            // Lấy thông tin chi tiết của học sinh
            const studentsRes = await studentApi.getByIds(studentIds);
            const students = studentsRes.data.result || [];
            setChildren(students);

            // Lấy học phí cho từng học sinh
            const feesMap: Record<string, EnhancedTuitionFee[]> = {};
            const classesMap: Record<string, ClassResponse> = {};
            const summariesMap: Record<string, ChildFeeSummary> = {};
            const monthsMap: Record<string, Set<string>> = {};

            for (const student of students) {
                const feesRes = await tuitionFeeApi.getAll(student.userId, undefined, 0, 100, 'yearMonth,DESC');
                const fees = feesRes.data.result.content || [];

                // Lấy thông tin lớp học cho mỗi học phí
                for (const fee of fees) {
                    if (!classesMap[fee.classId]) {
                        try {
                            const classRes = await classApi.getById(fee.classId);
                            classesMap[fee.classId] = classRes.data.result;
                        } catch (error) {
                            console.error(`Error fetching class ${fee.classId}:`, error);
                        }
                    }
                    if (!monthsMap[student.userId]) monthsMap[student.userId] = new Set();
                    monthsMap[student.userId].add(fee.yearMonth);
                }

                // Sắp xếp theo tháng giảm dần
                const sortedFees = fees.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
                feesMap[student.userId] = sortedFees;

                // Tính toán tổng hợp cho từng con
                const totalUnpaid = sortedFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
                const unpaidMonths = sortedFees.filter(fee => fee.remainingAmount > 0).length;
                const totalPaidAmount = sortedFees.reduce((sum, fee) => sum + (fee.amount - fee.remainingAmount), 0);

                summariesMap[student.userId] = {
                    totalUnpaid,
                    unpaidMonths,
                    totalPaidAmount,
                    fees: sortedFees
                };
            }

            // Sắp xếp các tháng cho từng học sinh
            const monthsObj: Record<string, string[]> = {};
            for (const studentId in monthsMap) {
                monthsObj[studentId] = Array.from(monthsMap[studentId]).sort((a, b) => b.localeCompare(a));
            }
            setAvailableMonths(monthsObj);

            setTuitionFees(feesMap);
            setClasses(classesMap);
            setFeeSummaries(summariesMap);
        } catch (error) {
            console.error('Error fetching fees:', error);
        }
        setLoading(false);
    };

    // Fetch fees for a student with filters and pagination
    const fetchStudentFees = async (studentId: string, year: string, month: string, page: number) => {
        let yearMonth: string | undefined = undefined;
        if (month !== 'all') {
            yearMonth = `${year}-${month}`;
        }
        const res = await tuitionFeeApi.getAll(studentId, yearMonth, page, 5, 'yearMonth,DESC');
        const content = res.data.result.content || [];
        const total = res.data.result.page.totalPages;
        return { content, total };
    };

    // Fetch all students' fees (first load or when children change)
    const fetchAllFees = async (students: Student[], selectedMonths: Record<string, string>, selectedYears: Record<string, string>, pages: Record<string, number>) => {
        const feesMap: Record<string, EnhancedTuitionFee[]> = {};
        const totalPagesMap: Record<string, number> = {};
        for (const student of students) {
            const month = selectedMonths[student.userId] || 'all';
            const year = selectedYears[student.userId] || currentYear.toString();
            const page = pages[student.userId] || 0;
            const { content, total } = await fetchStudentFees(student.userId, year, month, page);
            feesMap[student.userId] = content;
            totalPagesMap[student.userId] = total;
        }
        setTuitionFees(feesMap);
        setTotalPages(totalPagesMap);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Khi thay đổi tháng/năm/page cho từng học sinh
    useEffect(() => {
        if (children.length === 0) return;
        fetchAllFees(children, selectedMonths, selectedYears, pages);
    }, [children, selectedMonths, selectedYears, pages]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatYearMonth = (yearMonth: string) => {
        const [year, month] = yearMonth.split('-');
        return `${month}/${year}`;
    };

    // Filter fees by month/year
    const getFilteredFees = (fees: EnhancedTuitionFee[], studentId: string) => {
        const selectedMonth = selectedMonths[studentId] || 'all';
        const selectedYear = selectedYears[studentId] || currentYear.toString();
        return fees.filter(fee => {
            const [year, month] = fee.yearMonth.split('-');
            const matchYear = year === selectedYear;
            const matchMonth = selectedMonth === 'all' ? true : month === selectedMonth;
            return matchYear && matchMonth;
        });
    };

    const handlePaymentClick = (fee: TuitionFeeResponse) => {
        setSelectedFee(fee);
        setPaymentAmount(fee.remainingAmount.toString());
        setIsPaymentDialogOpen(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedFee || !paymentAmount) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập số tiền hợp lệ",
                variant: "destructive"
            });
            return;
        }

        if (amount > selectedFee.remainingAmount) {
            toast({
                title: "Lỗi",
                description: "Số tiền đóng không được vượt quá số tiền còn nợ",
                variant: "destructive"
            });
            return;
        }

        setIsProcessingPayment(true);
        try {
            const paymentData: PaymentCreateRequest = {
                tuitionFeeId: selectedFee.tuitionFeeId,
                paidAmount: amount
            };

            await paymentApi.create(paymentData);

            toast({
                title: "Thành công",
                description: `Đã đóng ${formatCurrency(amount)} học phí thành công`
            });

            // Đóng dialog và refresh dữ liệu
            setIsPaymentDialogOpen(false);
            setSelectedFee(null);
            setPaymentAmount('');

            // Refresh lại dữ liệu học phí
            await fetchData();
        } catch (error) {
            console.error('Error creating payment:', error);
            toast({
                title: "Lỗi",
                description: "Không thể thực hiện thanh toán. Vui lòng thử lại.",
                variant: "destructive"
            });
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handlePaymentCancel = () => {
        setIsPaymentDialogOpen(false);
        setSelectedFee(null);
        setPaymentAmount('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div>Đang tải thông tin học phí...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Quản lý học phí</h1>
                <div className="text-sm text-gray-500">
                    Tổng cộng: {children.length} học sinh
                </div>
            </div>

            {children.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <div>Không có thông tin học phí</div>
                    </CardContent>
                </Card>
            ) : (
                children.map(child => {
                    const summary = feeSummaries[child.userId];
                    const childFees = tuitionFees[child.userId] || [];
                    const filteredFees = getFilteredFees(childFees, child.userId);
                    const unpaidFees = filteredFees.filter(fee => fee.remainingAmount > 0);
                    // Tổng tiền chưa đóng cho filter
                    const totalUnpaidFiltered = filteredFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
                    const totalPaidFiltered = filteredFees.reduce((sum, fee) => sum + (fee.amount - fee.remainingAmount), 0);
                    const unpaidMonthsFiltered = filteredFees.filter(fee => fee.remainingAmount > 0).length;

                    return (
                        <Card key={child.userId} className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center">
                                            <User className="mr-2 h-5 w-5" />
                                            {child.fullName || child.username}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Email: {child.email || 'Chưa cập nhật'}
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Label htmlFor={`month-select-${child.userId}`} className="text-sm font-medium">Chọn thời gian:</Label>
                                            <Select
                                                value={selectedMonths[child.userId] || 'all'}
                                                onValueChange={val => {
                                                    setSelectedMonths(prev => ({ ...prev, [child.userId]: val }));
                                                    setPages(prev => ({ ...prev, [child.userId]: 0 }));
                                                }}
                                            >
                                                <SelectTrigger className="w-36">
                                                    <SelectValue placeholder="Tất cả tháng" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả tháng</SelectItem>
                                                    {months.map((month, idx) => (
                                                        <SelectItem key={month} value={month}>{monthLabels[idx]}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Select
                                                value={selectedYears[child.userId] || currentYear.toString()}
                                                onValueChange={val => {
                                                    setSelectedYears(prev => ({ ...prev, [child.userId]: val }));
                                                    setPages(prev => ({ ...prev, [child.userId]: 0 }));
                                                }}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue placeholder="Năm" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map(year => (
                                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Thống kê tổng quan */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-blue-600 font-medium">Tháng chưa đóng</div>
                                                <div className="text-xl font-bold text-blue-800">{unpaidMonthsFiltered}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-green-600 font-medium">Tiền đã đóng</div>
                                                <div className="text-xl font-bold text-green-800">
                                                    {formatCurrency(totalPaidFiltered)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-red-600 font-medium">Tổng tiền chưa đóng</div>
                                                <div className="text-xl font-bold text-red-800">
                                                    {formatCurrency(totalUnpaidFiltered)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bảng chi tiết học phí */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Chi tiết học phí theo tháng</h3>
                                        {unpaidFees.length > 0 && (
                                            <Badge variant="destructive" className="text-sm">
                                                {unpaidFees.length} tháng chưa đóng
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50">
                                                    <TableHead className="font-semibold">Tháng</TableHead>
                                                    <TableHead className="font-semibold">Lớp học</TableHead>
                                                    <TableHead className="font-semibold text-right">Tiền gốc</TableHead>
                                                    <TableHead className="font-semibold text-right">Giảm giá (%)</TableHead>
                                                    <TableHead className="font-semibold text-right">Học phí</TableHead>
                                                    <TableHead className="font-semibold text-right">Đã đóng</TableHead>
                                                    <TableHead className="font-semibold text-right">Còn nợ</TableHead>
                                                    <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                                                    <TableHead className="font-semibold text-center">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredFees.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                            {(selectedMonths[child.userId] || 'all') === 'all' ? 'Chưa có thông tin học phí' : 'Không có dữ liệu cho thời gian đã chọn'}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredFees.map(fee => {
                                                        const paidAmount = fee.amount - fee.remainingAmount;
                                                        const originalAmount = fee.discount ? fee.amount / (1 - fee.discount / 100) : fee.amount;

                                                        return (
                                                            <TableRow
                                                                key={fee.tuitionFeeId}
                                                                className={fee.remainingAmount > 0 ? 'bg-red-50/30' : ''}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {formatYearMonth(fee.yearMonth)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {classes[fee.classId]?.className || 'Chưa cập nhật'}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {formatCurrency(originalAmount)}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {fee.discount ? `${fee.discount}%` : '0%'}
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(fee.amount)}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className="text-green-600 font-medium">
                                                                        {formatCurrency(paidAmount)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {fee.remainingAmount > 0 ? (
                                                                        <span className="text-red-600 font-bold">
                                                                            {formatCurrency(fee.remainingAmount)}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-green-600 font-medium">0 ₫</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {fee.remainingAmount === 0 ? (
                                                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                                            Đã đóng
                                                                        </Badge>
                                                                    ) : fee.remainingAmount === fee.amount ? (
                                                                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                                                            Chưa đóng
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                                            Đóng một phần
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {fee.remainingAmount === 0 ? (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            title="Tải biên lai"
                                                                            className="hover:bg-green-100 hover:text-green-700"
                                                                        >
                                                                            <Download className="h-4 w-4" />
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                                                            onClick={() => handlePaymentClick(fee)}
                                                                        >
                                                                            Đóng học phí
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    {/* Pagination */}
                                    {totalPages[child.userId] > 1 && (
                                        <div className="flex justify-end mt-2">
                                            <TablePagination
                                                currentPage={pages[child.userId] || 0}
                                                totalPages={totalPages[child.userId]}
                                                totalItems={childFees.length}
                                                onPageChange={page => setPages(prev => ({ ...prev, [child.userId]: page }))}
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}

            {/* Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CreditCard className="mr-2 h-5 w-5" />
                            Đóng học phí
                        </DialogTitle>
                    </DialogHeader>

                    {selectedFee && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Tháng:</span>
                                        <div className="font-medium">{formatYearMonth(selectedFee.yearMonth)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Lớp:</span>
                                        <div className="font-medium">{classes[selectedFee.classId]?.className || 'Chưa cập nhật'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Học phí:</span>
                                        <div className="font-medium">{formatCurrency(selectedFee.amount)}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Còn nợ:</span>
                                        <div className="font-medium text-red-600">{formatCurrency(selectedFee.remainingAmount)}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment-amount">Số tiền đóng</Label>
                                <Input
                                    id="payment-amount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    min="0"
                                    max={selectedFee.remainingAmount}
                                    step="1000"
                                />
                                <div className="text-xs text-gray-500">
                                    Tối đa: {formatCurrency(selectedFee.remainingAmount)}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handlePaymentCancel}
                                    disabled={isProcessingPayment}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handlePaymentSubmit}
                                    disabled={isProcessingPayment || !paymentAmount}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isProcessingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
} 