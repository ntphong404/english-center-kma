import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface Notification {
    id: string;
    title: string;
    content: string;
    type: "all" | "students" | "teachers";
    date: string;
    status: "sent" | "draft";
}

const sampleNotifications: Notification[] = [
    {
        id: "1",
        title: "Thông báo nghỉ lễ",
        content: "Trung tâm sẽ nghỉ lễ từ ngày 30/4 đến 1/5",
        type: "all",
        date: "2024-03-15",
        status: "sent",
    },
    {
        id: "2",
        title: "Lịch kiểm tra cuối khóa",
        content: "Lịch kiểm tra cuối khóa sẽ diễn ra vào tuần tới",
        type: "students",
        date: "2024-03-10",
        status: "sent",
    },
];

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState<Notification["type"]>("all");

    const handleSend = () => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            title,
            content,
            type,
            date: new Date().toISOString().split('T')[0],
            status: "sent",
        };
        setNotifications([newNotification, ...notifications]);
        setTitle("");
        setContent("");
        setType("all");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gửi thông báo</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Tạo thông báo mới</CardTitle>
                        <CardDescription>
                            Gửi thông báo đến học viên và giáo viên
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Tiêu đề</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề thông báo"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Đối tượng nhận</Label>
                                <Select value={type} onValueChange={(value: Notification["type"]) => setType(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn đối tượng nhận" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="students">Học viên</SelectItem>
                                        <SelectItem value="teachers">Giáo viên</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Nhập nội dung thông báo"
                                    rows={5}
                                />
                            </div>

                            <Button onClick={handleSend} className="w-full">
                                <Send className="mr-2 h-4 w-4" /> Gửi thông báo
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lịch sử thông báo</CardTitle>
                        <CardDescription>
                            Danh sách các thông báo đã gửi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-4 border rounded-lg space-y-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold">{notification.title}</h3>
                                        <span className="text-xs text-gray-500">{notification.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{notification.content}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                            {notification.type === "all"
                                                ? "Tất cả"
                                                : notification.type === "students"
                                                    ? "Học viên"
                                                    : "Giáo viên"}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                            Đã gửi
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 