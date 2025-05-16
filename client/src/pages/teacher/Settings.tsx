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
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";

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
    const [settings, setSettings] = useState<TeacherSettings>(defaultSettings);

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log("Saving settings:", settings);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cài đặt tài khoản</h2>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
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
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <Input
                                    id="phone"
                                    value={settings.phone}
                                    onChange={(e) =>
                                        setSettings({ ...settings, phone: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Tiểu sử</Label>
                                <Input
                                    id="bio"
                                    value={settings.bio}
                                    onChange={(e) =>
                                        setSettings({ ...settings, bio: e.target.value })
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
                                <Switch
                                    checked={settings.notifications.email}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            notifications: {
                                                ...settings.notifications,
                                                email: checked,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Thông báo qua SMS</Label>
                                    <p className="text-sm text-gray-500">
                                        Nhận thông báo qua tin nhắn SMS
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.sms}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            notifications: {
                                                ...settings.notifications,
                                                sms: checked,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Thông báo đẩy</Label>
                                    <p className="text-sm text-gray-500">
                                        Nhận thông báo đẩy trên ứng dụng
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.push}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            notifications: {
                                                ...settings.notifications,
                                                push: checked,
                                            },
                                        })
                                    }
                                />
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
                                <Switch
                                    checked={settings.security.twoFactor}
                                    onCheckedChange={(checked) =>
                                        setSettings({
                                            ...settings,
                                            security: {
                                                ...settings.security,
                                                twoFactor: checked,
                                            },
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            security: {
                                                ...settings.security,
                                                sessionTimeout: parseInt(e.target.value),
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 