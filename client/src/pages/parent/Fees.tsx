import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Fee {
    id: string;
    childId: string;
    childName: string;
    month: string;
    className: string;
    amount: number;
    status: 'paid' | 'pending';
    paidDate?: string;
    dueDate: string;
}

const fees: Fee[] = [
    {
        id: '1',
        childId: '1',
        childName: 'Nguyễn Văn An',
        month: '04/2024',
        className: 'Tiếng Anh Giao Tiếp A1',
        amount: 2000000,
        status: 'paid',
        paidDate: '01/04/2024',
        dueDate: '05/04/2024',
    },
    {
        id: '2',
        childId: '1',
        childName: 'Nguyễn Văn An',
        month: '05/2024',
        className: 'Tiếng Anh Giao Tiếp A1',
        amount: 2000000,
        status: 'pending',
        dueDate: '05/05/2024',
    },
    {
        id: '3',
        childId: '2',
        childName: 'Nguyễn Thị Bình',
        month: '04/2024',
        className: 'Tiếng Anh Giao Tiếp B1',
        amount: 2500000,
        status: 'paid',
        paidDate: '02/04/2024',
        dueDate: '05/04/2024',
    },
    {
        id: '4',
        childId: '2',
        childName: 'Nguyễn Thị Bình',
        month: '05/2024',
        className: 'Tiếng Anh Giao Tiếp B1',
        amount: 2500000,
        status: 'pending',
        dueDate: '05/05/2024',
    },
];

const children = Array.from(new Set(fees.map(f => f.childId))).map(childId => {
    const fee = fees.find(f => f.childId === childId);
    return { id: childId, name: fee?.childName || '' };
});

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function ParentFees() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Học phí</h1>
            {children.map(child => {
                const childFees = fees.filter(f => f.childId === child.id);
                const totalPaid = childFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
                const totalPending = childFees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
                return (
                    <Card key={child.id} className="mb-6">
                        <CardHeader>
                            <CardTitle>{child.name}</CardTitle>
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
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Hạn nộp</TableHead>
                                        <TableHead>Ngày đóng</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {childFees.map(fee => (
                                        <TableRow key={fee.id}>
                                            <TableCell>{fee.month}</TableCell>
                                            <TableCell>{fee.className}</TableCell>
                                            <TableCell>{formatCurrency(fee.amount)}</TableCell>
                                            <TableCell>
                                                {fee.status === 'paid' ? (
                                                    <Badge className="bg-green-500">Đã đóng</Badge>
                                                ) : (
                                                    <Badge className="bg-yellow-500">Chờ đóng</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{fee.dueDate}</TableCell>
                                            <TableCell>{fee.paidDate || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {fee.status === 'paid' && (
                                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
} 