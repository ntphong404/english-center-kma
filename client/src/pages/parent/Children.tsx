import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, BookOpen, Award, Clock } from 'lucide-react';

interface Child {
    id: string;
    name: string;
    class: string;
    teacher: string;
    level: string;
    progress: {
        grammar: number;
        vocabulary: number;
        pronunciation: number;
    };
    attendance: {
        total: number;
        present: number;
        absent: number;
    };
    performance: {
        averageScore: number;
        totalHours: number;
        completedLessons: number;
    };
}

const children: Child[] = [
    {
        id: "1",
        name: "Nguyễn Văn An",
        class: "Lớp 3.1 - 2024",
        teacher: "Nguyễn Thị Hồng",
        level: "Beginner",
        progress: {
            grammar: 75,
            vocabulary: 60,
            pronunciation: 85,
        },
        attendance: {
            total: 48,
            present: 42,
            absent: 6,
        },
        performance: {
            averageScore: 8.5,
            totalHours: 45,
            completedLessons: 12,
        },
    },
    {
        id: "2",
        name: "Nguyễn Thị Bình",
        class: "Lớp 4.2 - 2024",
        teacher: "Trần Văn Minh",
        level: "Intermediate",
        progress: {
            grammar: 85,
            vocabulary: 75,
            pronunciation: 80,
        },
        attendance: {
            total: 48,
            present: 45,
            absent: 3,
        },
        performance: {
            averageScore: 9.0,
            totalHours: 48,
            completedLessons: 15,
        },
    },
];

export default function ParentChildren() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-8">Thông tin học sinh</h1>

            <div className="grid gap-6">
                {children.map((child) => (
                    <Card key={child.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{child.name}</CardTitle>
                                    <CardDescription>
                                        Lớp: {child.class} | Giáo viên: {child.teacher}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">{child.level}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Tiến độ học tập</h3>
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Ngữ pháp</span>
                                                    <span>{child.progress.grammar}%</span>
                                                </div>
                                                <Progress value={child.progress.grammar} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Từ vựng</span>
                                                    <span>{child.progress.vocabulary}%</span>
                                                </div>
                                                <Progress value={child.progress.vocabulary} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>Phát âm</span>
                                                    <span>{child.progress.pronunciation}%</span>
                                                </div>
                                                <Progress value={child.progress.pronunciation} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Điểm danh</h3>
                                        <dl className="grid grid-cols-2 gap-2 text-sm">
                                            <dt className="text-gray-500">Tổng số buổi:</dt>
                                            <dd>{child.attendance.total}</dd>
                                            <dt className="text-gray-500">Có mặt:</dt>
                                            <dd className="text-green-600">{child.attendance.present}</dd>
                                            <dt className="text-gray-500">Vắng mặt:</dt>
                                            <dd className="text-red-600">{child.attendance.absent}</dd>
                                        </dl>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Kết quả học tập</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Điểm trung bình
                                                    </CardTitle>
                                                    <Award className="h-4 w-4 text-blue-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{child.performance.averageScore}</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Tổng số giờ học
                                                    </CardTitle>
                                                    <Clock className="h-4 w-4 text-green-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{child.performance.totalHours}</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">
                                                        Số bài học đã hoàn thành
                                                    </CardTitle>
                                                    <BookOpen className="h-4 w-4 text-purple-500" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{child.performance.completedLessons}</div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
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
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 