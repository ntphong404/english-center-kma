import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import tuitionFeeApi from '@/api/tuitionFeeApi';
import { Student } from '@/types/user';
import { TuitionFeeResponse } from '@/types/tuitionfee';
import { ClassResponse } from '@/types/entityclass';
import { PageResponse } from '@/types/api';

interface EnhancedTuitionFee extends TuitionFeeResponse {
    className?: string;
    studentName?: string;
}

export default function ParentFees() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Student[]>([]);
    const [tuitionFees, setTuitionFees] = useState<Record<string, EnhancedTuitionFee[]>>({});
    const [classes, setClasses] = useState<Record<string, ClassResponse>>({});

    useEffect(() => {
        async function fetchData() {
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
                }

                setTuitionFees(feesMap);
                setClasses(classesMap);
            } catch (error) {
                console.error('Error fetching fees:', error);
            }
            setLoading(false);
        }

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

    if (loading) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Học phí</h1>
            {children.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        Không có thông tin học phí
                    </CardContent>
                </Card>
            ) : (
                children.map(child => {
                    const childFees = tuitionFees[child.userId] || [];
                    const totalPaid = childFees.reduce((sum, f) => sum + (f.amount - f.remainingAmount), 0);
                    const totalPending = childFees.reduce((sum, f) => sum + f.remainingAmount, 0);

                    return (
                        <Card key={child.userId} className="mb-6">
                            <CardHeader>
                                <CardTitle>{child.fullName || child.username}</CardTitle>
                                <CardDescription>Lịch sử đóng học phí</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-6 mb-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Đã đóng</div>
                                        <div className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Còn nợ</div>
                                        <div className="text-lg font-bold text-yellow-600">{formatCurrency(totalPending)}</div>
                                    </div>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tháng</TableHead>
                                            <TableHead>Lớp</TableHead>
                                            <TableHead>Học phí</TableHead>
                                            <TableHead>Đã đóng</TableHead>
                                            <TableHead>Còn nợ</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {childFees.map(fee => {
                                            const paidAmount = fee.amount - fee.remainingAmount;

                                            return (
                                                <TableRow key={fee.tuitionFeeId}>
                                                    <TableCell>{formatYearMonth(fee.yearMonth)}</TableCell>
                                                    <TableCell>{classes[fee.classId]?.className || 'Chưa cập nhật'}</TableCell>
                                                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                                                    <TableCell>{formatCurrency(paidAmount)}</TableCell>
                                                    <TableCell>{formatCurrency(fee.remainingAmount)}</TableCell>
                                                    <TableCell>
                                                        {fee.remainingAmount === 0 ? (
                                                            <Badge className="bg-green-500">Đã đóng</Badge>
                                                        ) : fee.remainingAmount === fee.amount ? (
                                                            <Badge className="bg-yellow-500">Chưa đóng</Badge>
                                                        ) : (
                                                            <Badge className="bg-blue-500">Đã đóng một phần</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {fee.remainingAmount === 0 && (
                                                            <Button variant="ghost" size="icon" title="Tải biên lai">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
} 