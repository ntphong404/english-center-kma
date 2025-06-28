import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, AlertCircle, DollarSign, Calendar, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface EnhancedTuitionFee extends TuitionFeeResponse {
    className?: string;
    studentName?: string;
}

interface ChildFeeSummary {
    totalUnpaid: number;
    unpaidMonths: number;
    overdueMonths: number;
    totalOriginalAmount: number;
    totalDiscountAmount: number;
    totalPaidAmount: number;
    fees: EnhancedTuitionFee[];
}

export default function ParentFees() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Student[]>([]);
    const [tuitionFees, setTuitionFees] = useState<Record<string, EnhancedTuitionFee[]>>({});
    const [classes, setClasses] = useState<Record<string, ClassResponse>>({});
    const [feeSummaries, setFeeSummaries] = useState<Record<string, ChildFeeSummary>>({});
    
    // Payment dialog states
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState<TuitionFeeResponse | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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
                }

                // Sắp xếp theo tháng giảm dần
                const sortedFees = fees.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
                feesMap[student.userId] = sortedFees;

                // Tính toán tổng hợp cho từng con
                const totalUnpaid = sortedFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
                const unpaidMonths = sortedFees.filter(fee => fee.remainingAmount > 0).length;
                
                // Tính số tháng quá hạn (giả sử quá hạn nếu là tháng trước tháng hiện tại)
                const currentDate = new Date();
                const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
                const overdueMonths = sortedFees.filter(fee => 
                    fee.remainingAmount > 0 && fee.yearMonth < currentYearMonth
                ).length;

                // Tính toán các khoản tiền
                const totalOriginalAmount = sortedFees.reduce((sum, fee) => {
                    const original = fee.discount ? fee.amount / (1 - fee.discount / 100) : fee.amount;
                    return sum + original;
                }, 0);
                const totalDiscountAmount = sortedFees.reduce((sum, fee) => {
                    const original = fee.discount ? fee.amount / (1 - fee.discount / 100) : fee.amount;
                    return sum + (original - fee.amount);
                }, 0);
                const totalPaidAmount = sortedFees.reduce((sum, fee) => sum + (fee.amount - fee.remainingAmount), 0);

                summariesMap[student.userId] = {
                    totalUnpaid,
                    unpaidMonths,
                    overdueMonths,
                    totalOriginalAmount,
                    totalDiscountAmount,
                    totalPaidAmount,
                    fees: sortedFees
                };
            }

            setTuitionFees(feesMap);
            setClasses(classesMap);
            setFeeSummaries(summariesMap);
        } catch (error) {
            console.error('Error fetching fees:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const isOverdue = (yearMonth: string) => {
        const currentDate = new Date();
        const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        return yearMonth < currentYearMonth;
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
                    const unpaidFees = childFees.filter(fee => fee.remainingAmount > 0);

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
                                    {summary.totalUnpaid > 0 && (
                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Tổng nợ</div>
                                            <div className="text-2xl font-bold text-red-600">
                                                {formatCurrency(summary.totalUnpaid)}
                                            </div>
                                        </div>
                                    )}
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
                                                <div className="text-xl font-bold text-blue-800">{summary.unpaidMonths}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-yellow-600 font-medium">Tháng quá hạn</div>
                                                <div className="text-xl font-bold text-yellow-800">{summary.overdueMonths}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-red-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-red-600 font-medium">Tổng nợ</div>
                                                <div className="text-xl font-bold text-red-800">
                                                    {formatCurrency(summary.totalUnpaid)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thống kê tài chính */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-gray-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-gray-600 font-medium">Tổng tiền gốc</div>
                                                <div className="text-lg font-bold text-gray-800">
                                                    {formatCurrency(summary.totalOriginalAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-green-600 font-medium">Tiền đã giảm</div>
                                                <div className="text-lg font-bold text-green-800">
                                                    {formatCurrency(summary.totalDiscountAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-blue-600 font-medium">Tiền đã đóng</div>
                                                <div className="text-lg font-bold text-blue-800">
                                                    {formatCurrency(summary.totalPaidAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-red-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-red-600 font-medium">Tiền còn nợ</div>
                                                <div className="text-lg font-bold text-red-800">
                                                    {formatCurrency(summary.totalUnpaid)}
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
                                                    <TableHead className="font-semibold text-right">Tiền giảm</TableHead>
                                                    <TableHead className="font-semibold text-right">Học phí</TableHead>
                                                    <TableHead className="font-semibold text-right">Đã đóng</TableHead>
                                                    <TableHead className="font-semibold text-right">Còn nợ</TableHead>
                                                    <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                                                    <TableHead className="font-semibold text-center">Thao tác</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {childFees.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                            Chưa có thông tin học phí
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    childFees.map(fee => {
                                                        const paidAmount = fee.amount - fee.remainingAmount;
                                                        const isOverdueMonth = isOverdue(fee.yearMonth);
                                                        const originalAmount = fee.discount ? fee.amount / (1 - fee.discount / 100) : fee.amount;
                                                        const discountAmount = originalAmount - fee.amount;

                                                        return (
                                                            <TableRow 
                                                                key={fee.tuitionFeeId}
                                                                className={fee.remainingAmount > 0 ? 'bg-red-50/30' : ''}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    <div className="flex items-center">
                                                                        {formatYearMonth(fee.yearMonth)}
                                                                        {isOverdueMonth && fee.remainingAmount > 0 && (
                                                                            <Badge variant="destructive" className="ml-2 text-xs">
                                                                                Quá hạn
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {classes[fee.classId]?.className || 'Chưa cập nhật'}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className="text-gray-600 font-medium">
                                                                        {formatCurrency(originalAmount)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {discountAmount > 0 ? (
                                                                        <span className="text-green-600 font-medium">
                                                                            -{formatCurrency(discountAmount)}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400">0 ₫</span>
                                                                    )}
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