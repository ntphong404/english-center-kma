import { useEffect, useState } from 'react';
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
import { Save } from "lucide-react";
import teacherApi from '@/api/teacherApi';
import { getUser } from '@/store/userStore';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from "@/components/ui/switch";

interface TeacherSettings {
    name: string;
    email: string;
    phone: string;
    bio: string;
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
    security: {
        twoFactor: boolean;
        sessionTimeout: number;
    };
}

const defaultSettings: TeacherSettings = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    bio: "Giáo viên tiếng Anh với 5 năm kinh nghiệm giảng dạy",
    notifications: {
        email: true,
        sms: false,
        push: true,
    },
    security: {
        twoFactor: false,
        sessionTimeout: 30,
    },
};

export default function TeacherSettings() {
    const [settings, setSettings] = useState({
        name: '',
        email: '',
        dob: '',
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTeacher = async () => {
            const user = getUser();
            if (user) {
                try {
                    const res = await teacherApi.getById(user.userId);
                    const teacher = res.data.result;
                    setSettings({
                        name: teacher.fullName || '',
                        email: teacher.email || '',
                        dob: teacher.dob || '',
                    });
                } catch {
                    toast({ title: 'Lỗi', description: 'Không thể tải thông tin giáo viên.' });
                }
            }
        };
        fetchTeacher();
    }, []);

    const handleSave = async () => {
        const user = getUser();
        if (user) {
            setLoading(true);
            try {
                await teacherApi.patch(user.userId, {
                    fullName: settings.name,
                    email: settings.email,
                    dob: settings.dob,
                    salary: 0, // hoặc lấy từ API nếu muốn cho phép sửa
                });
                toast({ title: 'Thành công', description: 'Đã cập nhật thông tin.' });
            } catch {
                toast({ title: 'Lỗi', description: 'Cập nhật thất bại.' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cài đặt tài khoản</h2>
                <Button onClick={handleSave} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin cá nhân</CardTitle>
                        <CardDescription>
                            Cập nhật thông tin cá nhân của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Họ tên</Label>
                                <Input
                                    id="name"
                                    value={settings.name}
                                    onChange={(e) =>
                                        setSettings({ ...settings, name: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={settings.email}
                                    onChange={(e) =>
                                        setSettings({ ...settings, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">Ngày sinh</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={settings.dob || ''}
                                    onChange={(e) =>
                                        setSettings({ ...settings, dob: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Thông báo</CardTitle>
                        <CardDescription>
                            Cấu hình các kênh thông báo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Thông báo qua email</Label>
                                    <p className="text-sm text-gray-500">
                                        Nhận thông báo qua email
                                    </p>
                                </div>
                                <Switch checked={true} disabled />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Thông báo qua SMS</Label>
                                    <p className="text-sm text-gray-500">
                                        Nhận thông báo qua tin nhắn SMS
                                    </p>
                                </div>
                                <Switch checked={false} disabled />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Thông báo đẩy</Label>
                                    <p className="text-sm text-gray-500">
                                        Nhận thông báo đẩy trên ứng dụng
                                    </p>
                                </div>
                                <Switch checked={true} disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Bảo mật</CardTitle>
                        <CardDescription>
                            Cấu hình các tùy chọn bảo mật
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Xác thực hai yếu tố</Label>
                                    <p className="text-sm text-gray-500">
                                        Yêu cầu xác thực hai yếu tố khi đăng nhập
                                    </p>
                                </div>
                                <Switch checked={false} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
                                <Input id="sessionTimeout" type="number" value={30} disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 