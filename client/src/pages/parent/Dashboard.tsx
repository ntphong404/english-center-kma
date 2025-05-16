import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, GraduationCap, CreditCard, Users, Bell } from 'lucide-react';

interface Child {
    id: string;
    name: string;
    class: string;
    teacher: string;
    nextClass: string;
    nextClassDate: string;
    attendance: {
        total: number;
        present: number;
        absent: number;
    };
    fees: {
        total: string;
        paid: string;
        remaining: string;
        dueDate: string;
    };
}

const ParentDashboard = () => {
    const children: Child[] = [
        {
            id: "1",
            name: "Nguyễn Văn An",
            class: "Lớp 3.1 - 2024",
            teacher: "Nguyễn Thị Hồng",
            nextClass: "Thứ 3, 15:00 - 16:30",
            nextClassDate: "21/05/2024",
            attendance: {
                total: 48,
                present: 42,
                absent: 6,
            },
            fees: {
                total: "3.600.000đ",
                paid: "2.400.000đ",
                remaining: "1.200.000đ",
                dueDate: "30/05/2024",
            },
        },
        {
            id: "2",
            name: "Nguyễn Thị Bình",
            class: "Lớp 4.2 - 2024",
            teacher: "Trần Văn Minh",
            nextClass: "Thứ 4, 17:00 - 18:30",
            nextClassDate: "22/05/2024",
            attendance: {
                total: 48,
                present: 45,
                absent: 3,
            },
            fees: {
                total: "3.600.000đ",
                paid: "3.600.000đ",
                remaining: "0đ",
                dueDate: "30/05/2024",
            },
        },
    ];

    // Stats for each child
    const getChildStats = (child: Child) => [
        {
            title: 'Điểm danh',
            value: `${child.attendance.present}/${child.attendance.total}`,
            icon: <Users className="h-5 w-5 text-blue-500" />,
            change: `${Math.round((child.attendance.present / child.attendance.total) * 100)}%`,
            changeDirection: 'up',
            changeDescription: 'tỷ lệ đi học'
        },
        {
            title: 'Học phí đã đóng',
            value: child.fees.paid,
            icon: <CreditCard className="h-5 w-5 text-green-500" />,
            change: child.fees.remaining === "0đ" ? "100%" : `${Math.round((parseInt(child.fees.paid.replace(/[^\d]/g, '')) / parseInt(child.fees.total.replace(/[^\d]/g, ''))) * 100)}%`,
            changeDirection: child.fees.remaining === "0đ" ? 'up' : 'down',
            changeDescription: 'tỷ lệ đóng học phí'
        },
        {
            title: 'Buổi học tiếp theo',
            value: child.nextClass,
            icon: <Calendar className="h-5 w-5 text-yellow-500" />,
            change: child.nextClassDate,
            changeDirection: 'up',
            changeDescription: 'ngày học'
        },
        {
            title: 'Thông báo',
            value: child.fees.remaining !== "0đ" ? "Cần đóng học phí" : "Đã đóng đủ",
            icon: <Bell className="h-5 w-5 text-red-500" />,
            change: child.fees.remaining,
            changeDirection: child.fees.remaining !== "0đ" ? 'down' : 'up',
            changeDescription: 'học phí còn lại'
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>

            {children.map((child) => (
                <div key={child.id} className="space-y-6">
                    <h2 className="text-2xl font-semibold">{child.name}</h2>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {getChildStats(child).map((stat, index) => (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    {stat.icon}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className={stat.changeDirection === 'up' ? 'text-green-500' : 'text-red-500'}>
                                            {stat.change}
                                        </span>
                                        {' '}
                                        {stat.changeDescription}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Class Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin lớp học</CardTitle>
                            <CardDescription>
                                Chi tiết về lớp học và học phí
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-4">Thông tin lớp</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Lớp:</dt>
                                            <dd className="font-medium">{child.class}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Giáo viên:</dt>
                                            <dd className="font-medium">{child.teacher}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Buổi học tiếp theo:</dt>
                                            <dd className="font-medium">{child.nextClass}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Ngày:</dt>
                                            <dd className="font-medium">{child.nextClassDate}</dd>
                                        </div>
                                    </dl>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-4">Học phí</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Tổng học phí:</dt>
                                            <dd className="font-medium">{child.fees.total}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Đã đóng:</dt>
                                            <dd className="font-medium text-green-600">{child.fees.paid}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Còn lại:</dt>
                                            <dd className="font-medium text-red-600">{child.fees.remaining}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Hạn nộp:</dt>
                                            <dd className="font-medium">{child.fees.dueDate}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Xem lịch học
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Xem thông tin lớp
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Xem học phí
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export default ParentDashboard;