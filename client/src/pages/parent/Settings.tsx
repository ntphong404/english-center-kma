import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin cá nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Họ và tên</Label>
                        <Input value={settings.name} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input value={settings.email} onChange={e => handleChange('email', e.target.value)} />
                    </div>
                    <div>
                        <Label>Số điện thoại</Label>
                        <Input value={settings.phone} onChange={e => handleChange('phone', e.target.value)} />
                    </div>
                    <div>
                        <Label>Địa chỉ</Label>
                        <Input value={settings.address} onChange={e => handleChange('address', e.target.value)} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Thông báo</CardTitle>
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
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Xác thực 2 lớp</Label>
                        <Switch checked={settings.security.twoFactor} onCheckedChange={v => handleSecurityChange('twoFactor', v)} />
                    </div>
                </CardContent>
            </Card>
            <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
        </div>
    );
} 