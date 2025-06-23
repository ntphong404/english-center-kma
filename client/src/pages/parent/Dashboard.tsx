import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, GraduationCap, CreditCard, Users, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getUser } from '@/store/userStore';
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import attendanceApi from '@/api/attendanceApi';
import tuitionFeeApi from '@/api/tuitionFeeApi';
import { Parent, Student } from '@/types/user';
import { ClassResponse } from '@/types/entityclass';
import { AttendanceResponse } from '@/types/attendance';
import { TuitionFeeResponse } from '@/types/tuitionfee';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChildData {
    student: Student;
    class?: ClassResponse;
    teacher?: { fullName: string };
    attendance: {
        total: number;
        present: number;
        absent: number;
    };
    fees: {
        total: number;
        paid: number;
        remaining: number;
        dueDate?: string;
    };
    nextClass?: {
        time: string;
        date: string;
    };
}

const ParentDashboard = () => {
    const [children, setChildren] = useState<ChildData[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const currentUser = getUser();

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.userId) return;

            setLoading(true);
            try {
                // Get parent info with student IDs
                const parentRes = await parentApi.getById(currentUser.userId);
                const parent: Parent = parentRes.data.result;

                if (!parent.studentIds || parent.studentIds.length === 0) {
                    setChildren([]);
                    return;
                }

                // Get all students of this parent
                const studentsRes = await studentApi.getByIds(parent.studentIds);
                const students: Student[] = studentsRes.data.result || [];

                // Fetch data for each student
                const childrenData: ChildData[] = await Promise.all(
                    students.map(async (student) => {
                        // Get student's classes
                        const classesRes = await classApi.getAll(undefined, undefined, student.userId, undefined, 0, 10);
                        const classes = classesRes.data.result.content || [];
                        const studentClass = classes[0]; // Get first class

                        // Get attendance data
                        let attendance = { total: 0, present: 0, absent: 0 };
                        if (studentClass) {
                            try {
                                const attendanceRes = await attendanceApi.getAll(undefined, studentClass.classId, undefined, 0, 100);
                                let attendances: any[] = [];
                                const result = attendanceRes.data.result;
                                if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                                    attendances = result.content;
                                } else if (Array.isArray(result)) {
                                    attendances = result;
                                }

                                attendance.total = attendances.length;
                                attendance.present = attendances.reduce((total, att) => {
                                    const studentAtt = att.studentAttendances.find(sa => sa.studentId === student.userId);
                                    return total + (studentAtt?.status === 'PRESENT' ? 1 : 0);
                                }, 0);
                                attendance.absent = attendance.total - attendance.present;
                            } catch (error) {
                                console.error('Error fetching attendance:', error);
                            }
                        }

                        // Get tuition fee data
                        let fees = { total: 0, paid: 0, remaining: 0, dueDate: undefined as string | undefined };
                        try {
                            const feesRes = await tuitionFeeApi.getAll(student.userId, undefined, 0, 100);
                            let tuitionFees: any[] = [];
                            const result = feesRes.data.result;
                            if (result && typeof result === 'object' && 'content' in result && Array.isArray(result.content)) {
                                tuitionFees = result.content;
                            } else if (Array.isArray(result)) {
                                tuitionFees = result;
                            }

                            fees.total = tuitionFees.reduce((total, fee) => total + (fee.amount || 0), 0);
                            fees.paid = tuitionFees.reduce((total, fee) => total + (fee.paidAmount || 0), 0);
                            fees.remaining = fees.total - fees.paid;

                            // Get due date from latest fee
                            const latestFee = tuitionFees[0];
                            if (latestFee?.dueDate) {
                                fees.dueDate = format(new Date(latestFee.dueDate), 'dd/MM/yyyy', { locale: vi });
                            }
                        } catch (error) {
                            console.error('Error fetching fees:', error);
                        }

                        // Get teacher info
                        let teacher = undefined;
                        if (studentClass?.teacherId) {
                            try {
                                // Note: Assuming there's a teacher API, but we'll use a simple approach for now
                                teacher = { fullName: 'Giáo viên' }; // Placeholder
                            } catch (error) {
                                console.error('Error fetching teacher:', error);
                            }
                        }

                        // Calculate next class
                        let nextClass = undefined;
                        if (studentClass) {
                            const today = new Date();
                            const classDays = studentClass.daysOfWeek || [];
                            const startTime = studentClass.startTime;

                            // Simple next class calculation
                            nextClass = {
                                time: `${startTime} - ${studentClass.endTime}`,
                                date: format(today, 'dd/MM/yyyy', { locale: vi })
                            };
                        }

                        return {
                            student,
                            class: studentClass,
                            teacher,
                            attendance,
                            fees,
                            nextClass
                        };
                    })
                );

                setChildren(childrenData);
            } catch (error) {
                console.error('Error fetching parent dashboard data:', error);
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải dữ liệu dashboard',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser?.userId, toast]);

    // Stats for each child
    const getChildStats = (child: ChildData) => [
        {
            title: 'Điểm danh',
            value: `${child.attendance.present}/${child.attendance.total}`,
            icon: <Users className="h-5 w-5 text-blue-500" />,
            change: child.attendance.total > 0 ? `${Math.round((child.attendance.present / child.attendance.total) * 100)}%` : '0%',
            changeDirection: 'up',
            changeDescription: 'tỷ lệ đi học'
        },
        {
            title: 'Học phí đã đóng',
            value: `${child.fees.paid.toLocaleString('vi-VN')}đ`,
            icon: <CreditCard className="h-5 w-5 text-green-500" />,
            change: child.fees.total > 0 ? `${Math.round((child.fees.paid / child.fees.total) * 100)}%` : '0%',
            changeDirection: child.fees.remaining === 0 ? 'up' : 'down',
            changeDescription: 'tỷ lệ đóng học phí'
        },
        {
            title: 'Buổi học tiếp theo',
            value: child.nextClass?.time || 'Không có lịch',
            icon: <Calendar className="h-5 w-5 text-yellow-500" />,
            change: child.nextClass?.date || '',
            changeDirection: 'up',
            changeDescription: 'ngày học'
        },
        {
            title: 'Thông báo',
            value: child.fees.remaining > 0 ? "Cần đóng học phí" : "Đã đóng đủ",
            icon: <Bell className="h-5 w-5 text-red-500" />,
            change: `${child.fees.remaining.toLocaleString('vi-VN')}đ`,
            changeDirection: child.fees.remaining > 0 ? 'down' : 'up',
            changeDescription: 'học phí còn lại'
        }
    ];

    if (loading) {
        return <div className="flex items-center justify-center h-64">Đang tải...</div>;
    }

    if (children.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>
                <div className="text-center py-12">
                    <p className="text-gray-500">Bạn chưa có con em nào được đăng ký.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-8">Tổng quan</h1>

            {children.map((child) => (
                <div key={child.student.userId} className="space-y-6">
                    <h2 className="text-2xl font-semibold">{child.student.fullName || child.student.username}</h2>

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
                                            <dd className="font-medium">{child.class?.className || 'Chưa có lớp'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Giáo viên:</dt>
                                            <dd className="font-medium">{child.teacher?.fullName || 'Chưa có thông tin'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Buổi học tiếp theo:</dt>
                                            <dd className="font-medium">{child.nextClass?.time || 'Không có lịch'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Ngày:</dt>
                                            <dd className="font-medium">{child.nextClass?.date || 'Không có lịch'}</dd>
                                        </div>
                                    </dl>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-4">Học phí</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Tổng học phí:</dt>
                                            <dd className="font-medium">{child.fees.total.toLocaleString('vi-VN')}đ</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Đã đóng:</dt>
                                            <dd className="font-medium text-green-600">{child.fees.paid.toLocaleString('vi-VN')}đ</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Còn lại:</dt>
                                            <dd className="font-medium text-red-600">{child.fees.remaining.toLocaleString('vi-VN')}đ</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Hạn nộp:</dt>
                                            <dd className="font-medium">{child.fees.dueDate || 'Chưa có thông tin'}</dd>
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