import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard } from "lucide-react";

interface FeePayment {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    dueDate?: string;
}

const feePayments: FeePayment[] = [
    {
        id: "1",
        date: "01/04/2024",
        description: "Học phí tháng 4/2024 - Tiếng Anh Giao Tiếp A1",
        amount: 2000000,
        status: "paid",
    },
    {
        id: "2",
        date: "01/04/2024",
        description: "Học phí tháng 4/2024 - Ngữ Pháp Cơ Bản",
        amount: 1500000,
        status: "paid",
    },
    {
        id: "3",
        date: "-",
        description: "Học phí tháng 5/2024 - Tiếng Anh Giao Tiếp A1",
        amount: 2000000,
        status: "pending",
        dueDate: "01/05/2024",
    },
    {
        id: "4",
        date: "-",
        description: "Học phí tháng 5/2024 - Ngữ Pháp Cơ Bản",
        amount: 1500000,
        status: "pending",
        dueDate: "01/05/2024",
    },
];

export default function StudentFees() {
    const getStatusBadge = (status: FeePayment["status"]) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-500">Đã thanh toán</Badge>;
            case "pending":
                return <Badge className="bg-yellow-500">Chờ thanh toán</Badge>;
            case "overdue":
                return <Badge className="bg-red-500">Quá hạn</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const totalPaid = feePayments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0);

    const totalPending = feePayments
        .filter((payment) => payment.status === "pending")
        .reduce((sum, payment) => sum + payment.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Học phí</h2>
                <Button>
                    <CreditCard className="mr-2 h-4 w-4" /> Thanh toán học phí
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Đã thanh toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {formatCurrency(totalPaid)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Chờ thanh toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">
                            {formatCurrency(totalPending)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch sử thanh toán</CardTitle>
                    <CardDescription>
                        Xem lịch sử thanh toán học phí của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ngày</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Số tiền</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Hạn thanh toán</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feePayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>{payment.description}</TableCell>
                                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell>{payment.dueDate || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        {payment.status === "paid" && (
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 