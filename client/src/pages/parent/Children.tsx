import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Phone, Mail, MapPin, Users, GraduationCap, Clock, CalendarDays, DollarSign, Building, Users2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import attendanceApi from '@/api/attendanceApi';
import { Student, ClassDiscount } from '@/types/user';
import { ClassResponse } from '@/types/entityclass';
import { AttendanceResponse } from '@/types/attendance';
import { PageResponse } from '@/types/api';
import { toast } from 'sonner';

interface Parent {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    gender: string;
    phoneNumber: string;
    address: string;
    avatarUrl: string;
    dob: string;
    role: string;
    studentIds: string[];
}

interface ClassWithInfo extends ClassDiscount {
    classInfo?: ClassResponse;
}

interface StudentWithClasses extends Student {
    classDiscounts: ClassWithInfo[];
}

const Children: React.FC = () => {
    const [parent, setParent] = useState<Parent | null>(null);
    const [students, setStudents] = useState<StudentWithClasses[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithClasses | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceResponse[]>>({});

    useEffect(() => {
        loadParentData();
    }, []);

    const loadParentData = async () => {
        try {
            // Lấy thông tin parent từ localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                toast.error('Không tìm thấy thông tin người dùng');
                return;
            }

            const userData: Parent = JSON.parse(userStr);
            setParent(userData);

            // Lấy thông tin học sinh từ danh sách IDs
            if (userData.studentIds && userData.studentIds.length > 0) {
                const response = await studentApi.getByIds(userData.studentIds);
                if (response.data.code === 200) {
                    const studentsData = response.data.result;

                    // Lấy thông tin lớp cho từng học sinh
                    const studentsWithClasses = await Promise.all(
                        studentsData.map(async (student) => {
                            const classDiscountsWithInfo = await Promise.all(
                                student.classDiscounts.map(async (classDiscount) => {
                                    try {
                                        const classResponse = await classApi.getById(classDiscount.classId);
                                        if (classResponse.data.code === 200) {
                                            return {
                                                ...classDiscount,
                                                classInfo: classResponse.data.result
                                            };
                                        }
                                    } catch (error) {
                                        console.error(`Error loading class info for ${classDiscount.classId}:`, error);
                                    }
                                    return classDiscount;
                                })
                            );

                            return {
                                ...student,
                                classDiscounts: classDiscountsWithInfo
                            };
                        })
                    );

                    setStudents(studentsWithClasses);
                } else {
                    toast.error('Không thể tải thông tin học sinh');
                }
            }
        } catch (error) {
            console.error('Error loading parent data:', error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const loadAttendanceData = async (studentId: string, classId: string) => {
        try {
            const key = `${studentId}-${classId}`;
            if (attendanceData[key]) return; // Đã load rồi

            const response = await attendanceApi.getAll(studentId, classId, '', 0, 100);
            if (response.data.code === 200) {
                // Type assertion để xử lý PageResponse
                const pageResponse = response.data.result as any;
                const attendanceList = pageResponse.content || pageResponse;

                setAttendanceData(prev => ({
                    ...prev,
                    [key]: attendanceList
                }));
            }
        } catch (error) {
            console.error('Error loading attendance data:', error);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        return timeString.substring(0, 5); // Lấy HH:mm
    };

    const getGenderText = (gender: string) => {
        switch (gender?.toLowerCase()) {
            case 'male':
                return 'Nam';
            case 'female':
                return 'Nữ';
            default:
                return 'Chưa cập nhật';
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusText = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PRESENT':
                return 'Có mặt';
            case 'ABSENT':
                return 'Vắng';
            case 'LATE':
                return 'Muộn';
            default:
                return 'Chưa điểm danh';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PRESENT':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'ABSENT':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'LATE':
                return <MinusCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <MinusCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getDaysOfWeekText = (days: string[]) => {
        const dayMap: Record<string, string> = {
            'MONDAY': 'T2',
            'TUESDAY': 'T3',
            'WEDNESDAY': 'T4',
            'THURSDAY': 'T5',
            'FRIDAY': 'T6',
            'SATURDAY': 'T7',
            'SUNDAY': 'CN'
        };
        return days.map(day => dayMap[day] || day).join(', ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Thông tin học sinh</h1>
                    <p className="text-gray-600 mt-2">
                        Quản lý thông tin học sinh của bạn
                    </p>
                </div>
            </div>

            {students.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Chưa có học sinh nào
                            </h3>
                            <p className="text-gray-500">
                                Hiện tại chưa có học sinh nào được liên kết với tài khoản của bạn.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                        <Card key={student.userId} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={student.avatarUrl || ''} alt={student.fullName || ''} />
                                        <AvatarFallback className="text-lg">
                                            {getInitials(student.fullName || student.username)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{student.fullName || student.username}</CardTitle>
                                        <p className="text-sm text-gray-500">@{student.username}</p>
                                        <Badge variant="secondary" className="mt-1">
                                            Học sinh
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">
                                            {student.email || 'Chưa cập nhật email'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">
                                            {student.phoneNumber || 'Chưa cập nhật số điện thoại'}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">
                                            {formatDate(student.dob || '')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">
                                            {getGenderText(student.gender || '')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{student.address?.trim() ? student.address : 'Chưa cập nhật'}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Số lớp đăng ký:</span> {student.classDiscounts?.length || 0}
                                    </div>
                                    <Dialog open={isDialogOpen && selectedStudent?.userId === student.userId} onOpenChange={(open) => {
                                        setIsDialogOpen(open);
                                        if (open) {
                                            setSelectedStudent(student);
                                        } else {
                                            setSelectedStudent(null);
                                        }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <GraduationCap className="h-4 w-4 mr-2" />
                                                Xem thông tin lớp
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center space-x-2">
                                                    <GraduationCap className="h-5 w-5" />
                                                    <span>Thông tin lớp học - {student.fullName}</span>
                                                </DialogTitle>
                                            </DialogHeader>

                                            {student.classDiscounts && student.classDiscounts.length > 0 ? (
                                                <Accordion type="single" collapsible className="w-full">
                                                    {student.classDiscounts.map((classDiscount, index) => (
                                                        <AccordionItem key={index} value={`item-${index}`}>
                                                            <AccordionTrigger className="text-left border rounded-lg px-4 py-3 mb-2 transition-colors hover:bg-gray-100 focus:bg-gray-100 focus:outline-none hover:no-underline focus:no-underline">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="bg-primary/10 p-2 rounded-full">
                                                                        <GraduationCap className="h-4 w-4 text-primary" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">
                                                                            {classDiscount.classInfo?.className || `Lớp ${classDiscount.classId}`}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            Giảm giá: {classDiscount.discount}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent>
                                                                <div className="pt-4">
                                                                    <Tabs defaultValue="info" className="w-full">
                                                                        <TabsList className="grid w-full grid-cols-2">
                                                                            <TabsTrigger value="info">Thông tin lớp học</TabsTrigger>
                                                                            <TabsTrigger
                                                                                value="attendance"
                                                                                onClick={() => loadAttendanceData(student.userId, classDiscount.classId)}
                                                                            >
                                                                                Điểm danh
                                                                            </TabsTrigger>
                                                                        </TabsList>

                                                                        <TabsContent value="info" className="space-y-6">
                                                                            {classDiscount.classInfo ? (
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                                    <div className="space-y-4">
                                                                                        <div className="bg-gray-50 p-4 rounded-lg">
                                                                                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                                                                                                <GraduationCap className="h-5 w-5 mr-2" />
                                                                                                Thông tin cơ bản
                                                                                            </h4>
                                                                                            <div className="space-y-3">
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Tên lớp:</span>
                                                                                                    <span className="font-medium">{classDiscount.classInfo.className}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Khối:</span>
                                                                                                    <span className="font-medium">Khối {classDiscount.classInfo.grade}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Năm học:</span>
                                                                                                    <span className="font-medium">{classDiscount.classInfo.year}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Phòng học:</span>
                                                                                                    <span className="font-medium">{classDiscount.classInfo.roomName}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Trạng thái:</span>
                                                                                                    <Badge variant="default">{classDiscount.classInfo.status}</Badge>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                                                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                                                                                                <CalendarDays className="h-5 w-5 mr-2" />
                                                                                                Lịch học
                                                                                            </h4>
                                                                                            <div className="space-y-3">
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Ngày bắt đầu:</span>
                                                                                                    <span className="font-medium">{formatDate(classDiscount.classInfo.startDate)}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Ngày kết thúc:</span>
                                                                                                    <span className="font-medium">{formatDate(classDiscount.classInfo.endDate)}</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Giờ học:</span>
                                                                                                    <span className="font-medium">
                                                                                                        {formatTime(classDiscount.classInfo.startTime)} - {formatTime(classDiscount.classInfo.endTime)}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Thứ học:</span>
                                                                                                    <span className="font-medium">{getDaysOfWeekText(classDiscount.classInfo.daysOfWeek)}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-4">
                                                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                                                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                                                                                                <DollarSign className="h-5 w-5 mr-2" />
                                                                                                Thông tin học phí
                                                                                            </h4>
                                                                                            <div className="space-y-3">
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Học phí gốc:</span>
                                                                                                    <span className="font-medium">
                                                                                                        {classDiscount.classInfo.unitPrice.toLocaleString('vi-VN')} VNĐ
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Giảm giá:</span>
                                                                                                    <span className="font-medium text-green-600">
                                                                                                        {classDiscount.discount}%
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Học phí sau giảm:</span>
                                                                                                    <span className="font-medium text-green-600">
                                                                                                        {Math.round(classDiscount.classInfo.unitPrice * (1 - classDiscount.discount / 100)).toLocaleString('vi-VN')} VNĐ
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                                                            <h4 className="font-semibold text-lg mb-3 flex items-center">
                                                                                                <Users2 className="h-5 w-5 mr-2" />
                                                                                                Thông tin lớp
                                                                                            </h4>
                                                                                            <div className="space-y-3">
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Số học sinh:</span>
                                                                                                    <span className="font-medium">{classDiscount.classInfo.studentIds.length} học sinh</span>
                                                                                                </div>
                                                                                                <div className="flex justify-between">
                                                                                                    <span className="text-gray-600">Mã lớp:</span>
                                                                                                    <span className="font-medium text-sm">{classDiscount.classInfo.classId}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-center py-8">
                                                                                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                                                        Không thể tải thông tin lớp
                                                                                    </h3>
                                                                                    <p className="text-gray-500">
                                                                                        Mã lớp: {classDiscount.classId}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </TabsContent>

                                                                        <TabsContent value="attendance" className="space-y-4">
                                                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                                                <h4 className="font-semibold text-lg mb-3 flex items-center">
                                                                                    <Clock className="h-5 w-5 mr-2" />
                                                                                    Lịch sử điểm danh
                                                                                </h4>

                                                                                {(() => {
                                                                                    const key = `${student.userId}-${classDiscount.classId}`;
                                                                                    const attendanceList = attendanceData[key] || [];

                                                                                    if (attendanceList.length === 0) {
                                                                                        return (
                                                                                            <div className="text-center py-8">
                                                                                                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                                                                    Chưa có dữ liệu điểm danh
                                                                                                </h3>
                                                                                                <p className="text-gray-500">
                                                                                                    Chưa có lịch sử điểm danh cho lớp này.
                                                                                                </p>
                                                                                            </div>
                                                                                        );
                                                                                    }

                                                                                    return (
                                                                                        <div className="space-y-3">
                                                                                            {attendanceList.map((attendance, idx) => {
                                                                                                const studentAttendance = attendance.studentAttendances.find(
                                                                                                    sa => sa.studentId === student.userId
                                                                                                );

                                                                                                return (
                                                                                                    <div key={idx} className="bg-white p-4 rounded-lg border">
                                                                                                        <div className="flex items-center justify-between">
                                                                                                            <div className="flex items-center space-x-3">
                                                                                                                {getStatusIcon(studentAttendance?.status || '')}
                                                                                                                <div>
                                                                                                                    <div className="font-medium">
                                                                                                                        {formatDate(attendance.date)}
                                                                                                                    </div>
                                                                                                                    <div className="text-sm text-gray-500">
                                                                                                                        {getStatusText(studentAttendance?.status || '')}
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            {studentAttendance?.note && (
                                                                                                                <div className="text-sm text-gray-600 max-w-xs">
                                                                                                                    {studentAttendance.note}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                        </TabsContent>
                                                                    </Tabs>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        Chưa đăng ký lớp học nào
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        Học sinh chưa được đăng ký vào lớp học nào.
                                                    </p>
                                                </div>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Children;
