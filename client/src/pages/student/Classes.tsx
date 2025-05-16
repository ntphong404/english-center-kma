import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Video } from "lucide-react";

interface Course {
    id: string;
    name: string;
    teacher: string;
    level: string;
    progress: number;
    materials: {
        id: string;
        title: string;
        type: "document" | "video";
        url: string;
    }[];
}

const enrolledCourses: Course[] = [
    {
        id: "1",
        name: "Tiếng Anh Giao Tiếp A1",
        teacher: "Nguyễn Văn A",
        level: "Beginner",
        progress: 75,
        materials: [
            {
                id: "1",
                title: "Bài 1: Chào hỏi",
                type: "document",
                url: "#",
            },
            {
                id: "2",
                title: "Bài 2: Giới thiệu bản thân",
                type: "video",
                url: "#",
            },
        ],
    },
    {
        id: "2",
        name: "Ngữ Pháp Cơ Bản",
        teacher: "Trần Thị B",
        level: "Intermediate",
        progress: 60,
        materials: [
            {
                id: "3",
                title: "Bài 1: Thì hiện tại đơn",
                type: "document",
                url: "#",
            },
            {
                id: "4",
                title: "Bài 2: Thì hiện tại tiếp diễn",
                type: "video",
                url: "#",
            },
        ],
    },
];

export default function StudentClasses() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lớp học của tôi</h2>
            </div>

            <div className="grid gap-6">
                {enrolledCourses.map((course) => (
                    <Card key={course.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{course.name}</CardTitle>
                                    <CardDescription>
                                        Giáo viên: {course.teacher}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline">{course.level}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Tiến độ học tập</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold">Tài liệu học tập</h3>
                                    <div className="grid gap-2">
                                        {course.materials.map((material) => (
                                            <div
                                                key={material.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    {material.type === "document" ? (
                                                        <BookOpen className="h-4 w-4" />
                                                    ) : (
                                                        <Video className="h-4 w-4" />
                                                    )}
                                                    <span>{material.title}</span>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Tải xuống
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 