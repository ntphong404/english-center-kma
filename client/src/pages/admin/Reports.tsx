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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface StatCard {
    title: string;
    value: string | number;
    description: string;
}

const statCards: StatCard[] = [
    {
        title: "Tổng số học viên",
        value: 150,
        description: "Tăng 12% so với tháng trước",
    },
    {
        title: "Tổng số lớp học",
        value: 12,
        description: "Tăng 2 lớp so với tháng trước",
    },
    {
        title: "Doanh thu tháng",
        value: "45.000.000đ",
        description: "Tăng 8% so với tháng trước",
    },
    {
        title: "Tỷ lệ duy trì",
        value: "85%",
        description: "Tăng 5% so với tháng trước",
    },
];

interface TopClass {
    name: string;
    students: number;
    revenue: number;
    rating: number;
}

const topClasses: TopClass[] = [
    {
        name: "Lớp A1",
        students: 25,
        revenue: 5000000,
        rating: 4.8,
    },
    {
        name: "Lớp B1",
        students: 20,
        revenue: 4000000,
        rating: 4.7,
    },
    {
        name: "Lớp C1",
        students: 18,
        revenue: 3600000,
        rating: 4.6,
    },
];

export default function AdminReports() {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Báo cáo thống kê</h2>
                <Button>
                    <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top lớp học hiệu quả</CardTitle>
                    <CardDescription>
                        Danh sách các lớp học có hiệu quả cao nhất
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên lớp</TableHead>
                                <TableHead>Số học viên</TableHead>
                                <TableHead>Doanh thu</TableHead>
                                <TableHead>Đánh giá</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topClasses.map((classItem, index) => (
                                <TableRow key={index}>
                                    <TableCell>{classItem.name}</TableCell>
                                    <TableCell>{classItem.students}</TableCell>
                                    <TableCell>{formatCurrency(classItem.revenue)}</TableCell>
                                    <TableCell>{classItem.rating}/5.0</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bố học viên theo trình độ</CardTitle>
                        <CardDescription>
                            Thống kê số lượng học viên theo từng trình độ
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Beginner</span>
                                <span className="font-medium">45 học viên</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Intermediate</span>
                                <span className="font-medium">65 học viên</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Advanced</span>
                                <span className="font-medium">40 học viên</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu theo tháng</CardTitle>
                        <CardDescription>
                            Thống kê doanh thu trong 6 tháng gần đây
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Tháng 10/2023</span>
                                <span className="font-medium">35.000.000đ</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '70%' }}></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Tháng 11/2023</span>
                                <span className="font-medium">40.000.000đ</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span>Tháng 12/2023</span>
                                <span className="font-medium">45.000.000đ</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 