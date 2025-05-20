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

interface ParentSettings {
    name: string;
    email: string;
    phone: string;
    address: string;
    notifications: {
        email: boolean;
        sms: boolean;
    };
    security: {
        twoFactor: boolean;
    };
}

const defaultSettings: ParentSettings = {
    name: 'Nguyễn Văn Bố',
    email: 'phuhuynh@example.com',
    phone: '0987654321',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    notifications: {
        email: true,
        sms: false,
    },
    security: {
        twoFactor: false,
    },
};

export default function ParentSettings() {
    const [settings, setSettings] = useState<ParentSettings>(defaultSettings);
    const [saving, setSaving] = useState(false);

    const handleChange = (field: keyof ParentSettings, value: any) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    const handleNotifChange = (field: keyof ParentSettings['notifications'], value: boolean) => {
        setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }));
    };

    const handleSecurityChange = (field: keyof ParentSettings['security'], value: boolean) => {
        setSettings((prev) => ({ ...prev, security: { ...prev.security, [field]: value } }));
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            alert('Lưu cài đặt thành công!');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cài đặt tài khoản</h2>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </div>

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
                            <Label htmlFor="name">Họ và tên</Label>
                            <Input
                                id="name"
                                value={settings.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={settings.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                value={settings.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Input
                                id="address"
                                value={settings.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Thông báo</CardTitle>
                    <CardDescription>
                        Quản lý cài đặt thông báo của bạn
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Nhận thông báo qua Email</Label>
                        <Switch checked={settings.notifications.email} onCheckedChange={v => handleNotifChange('email', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Nhận thông báo qua SMS</Label>
                        <Switch checked={settings.notifications.sms} onCheckedChange={v => handleNotifChange('sms', v)} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bảo mật</CardTitle>
                    <CardDescription>
                        Quản lý cài đặt bảo mật tài khoản
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Xác thực 2 lớp</Label>
                        <Switch checked={settings.security.twoFactor} onCheckedChange={v => handleSecurityChange('twoFactor', v)} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 