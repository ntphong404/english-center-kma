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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";

interface SystemSettings {
    centerName: string;
    address: string;
    phone: string;
    email: string;
    currency: string;
    timezone: string;
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

const defaultSettings: SystemSettings = {
    centerName: "Trung tâm Anh ngữ ABC",
    address: "123 Đường ABC, Quận XYZ, TP.HCM",
    phone: "0123456789",
    email: "contact@abc.edu.vn",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
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

export default function AdminSettings() {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log("Saving settings:", settings);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cài đặt hệ thống</h2>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                </Button>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin trung tâm</CardTitle>
                        <CardDescription>
                            Cập nhật thông tin cơ bản của trung tâm
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="centerName">Tên trung tâm</Label>
                                <Input
                                    id="centerName"
                                    value={settings.centerName}
                                    onChange={(e) =>
                                        setSettings({ ...settings, centerName: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={settings.address}
                                    onChange={(e) =>
                                        setSettings({ ...settings, address: e.target.value })
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
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cài đặt chung</CardTitle>
                        <CardDescription>
                            Cấu hình các tùy chọn chung của hệ thống
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                                <Select
                                    value={settings.currency}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, currency: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VND">VND</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Múi giờ</Label>
                                <Select
                                    value={settings.timezone}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, timezone: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn múi giờ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</SelectItem>
                                        <SelectItem value="Asia/Singapore">Singapore (GMT+8)</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        Gửi thông báo qua email
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
                                        Gửi thông báo qua tin nhắn SMS
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
                                        Gửi thông báo đẩy trên ứng dụng
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