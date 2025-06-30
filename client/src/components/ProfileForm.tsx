import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit3,
    Save,
    X,
    Camera,
    Key
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AvatarEditor from './AvatarEditor';
import { getUser, setUser } from '@/store/userStore';
import { userApi } from '@/api/userApi';
import teacherApi from '@/api/teacherApi';
import studentApi from '@/api/studentApi';
import parentApi from '@/api/parentApi';

interface ProfileData {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    avatar?: string;
    bio?: string;
}

interface ProfileFormProps {
    profile: ProfileData;
    onProfileUpdate: (data: ProfileData) => void;
    onAvatarUpdate: (file: File) => void;
    role: string;
    roleIcon: React.ReactNode;
    additionalInfo?: React.ReactNode;
    extraSections?: React.ReactNode;
}

const getInitialFormData = () => {
    const user = getUser();
    if (!user) return {
        fullName: '', email: '', phoneNumber: '', address: '', dateOfBirth: '', avatar: '', bio: ''
    };
    return {
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dob || '',
        avatar: user.avatarUrl || '',
        bio: ''
    };
};

const ProfileForm: React.FC<ProfileFormProps> = ({
    profile,
    onProfileUpdate,
    onAvatarUpdate,
    role,
    roleIcon,
    additionalInfo,
    extraSections
}) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData());
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Fill lại form khi user thay đổi (login, reload, ...)
    useEffect(() => {
        setFormData(getInitialFormData());
    }, []);

    const handleSave = async () => {
        const user = getUser();
        if (!user) return;
        let patchApi;
        let updateData;
        switch (user.role?.toLowerCase()) {
            case 'admin':
                patchApi = userApi.patch;
                updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    dob: formData.dateOfBirth
                };
                break;
            case 'teacher':
                patchApi = teacherApi.patch;
                updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    dob: formData.dateOfBirth
                };
                break;
            case 'student':
                patchApi = studentApi.patch;
                updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    dob: formData.dateOfBirth
                };
                break;
            case 'parent':
                patchApi = parentApi.patch;
                updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    dob: formData.dateOfBirth
                };
                break;
            default:
                toast({ title: 'Lỗi', description: 'Không xác định được vai trò người dùng', variant: 'destructive' });
                return;
        }
        try {
            const res = await patchApi(user.userId, updateData);
            toast({ title: 'Thành công', description: 'Đã cập nhật thông tin cá nhân' });
            setUser({ ...user, ...updateData });
            setIsEditing(false);
        } catch (err) {
            toast({ title: 'Lỗi', description: 'Không thể cập nhật thông tin', variant: 'destructive' });
        }
    };

    const handleCancel = () => {
        setFormData(getInitialFormData());
        setIsEditing(false);
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu xác nhận không khớp",
                variant: "destructive"
            });
            return;
        }
        try {
            await userApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            toast({ title: 'Thành công', description: 'Đã đổi mật khẩu thành công' });
            setIsChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast({ title: 'Lỗi', description: 'Đổi mật khẩu thất bại', variant: 'destructive' });
        }
    };

    const handleAvatarChange = (file: File) => {
        setFormData(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
        onAvatarUpdate(file);
        setIsAvatarEditorOpen(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Trang cá nhân</h1>
                    <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-2">
                    {roleIcon}
                    {role}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Thông tin cơ bản */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Thông tin cá nhân</CardTitle>
                                    <CardDescription>
                                        Cập nhật thông tin cá nhân của bạn
                                    </CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleSave} size="sm">
                                            <Save className="w-4 h-4 mr-2" />
                                            Lưu
                                        </Button>
                                        <Button onClick={handleCancel} variant="outline" size="sm">
                                            <X className="w-4 h-4 mr-2" />
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Họ và tên</Label>
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            {formData.bio && (
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Giới thiệu</Label>
                                    <Textarea
                                        id="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        disabled={!isEditing}
                                        rows={3}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Extra sections */}
                    {extraSections}

                    {/* Đổi mật khẩu */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Đổi mật khẩu</CardTitle>
                                    <CardDescription>
                                        Cập nhật mật khẩu tài khoản của bạn
                                    </CardDescription>
                                </div>
                                {!isChangingPassword ? (
                                    <Button onClick={() => setIsChangingPassword(true)} variant="outline" size="sm">
                                        <Key className="w-4 h-4 mr-2" />
                                        Đổi mật khẩu
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={handleChangePassword} size="sm">
                                            <Save className="w-4 h-4 mr-2" />
                                            Lưu
                                        </Button>
                                        <Button onClick={() => setIsChangingPassword(false)} variant="outline" size="sm">
                                            <X className="w-4 h-4 mr-2" />
                                            Hủy
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        {isChangingPassword && (
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordForm.newPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Avatar */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        {formData.avatar ? (
                                            <AvatarImage src={formData.avatar} alt={formData.fullName} />
                                        ) : (
                                            <AvatarFallback className="text-lg">
                                                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'UKN'}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <Button
                                        size="sm"
                                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg z-10"
                                        onClick={() => setIsAvatarEditorOpen(true)}
                                    >
                                        <Camera className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold">{formData.fullName}</h3>
                                    <p className="text-sm text-muted-foreground">{role}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thông tin bổ sung */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thông tin bổ sung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {additionalInfo}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Avatar Editor Dialog */}
            <AvatarEditor
                currentAvatar={formData.avatar}
                username={formData.fullName}
                onAvatarChange={handleAvatarChange}
                isOpen={isAvatarEditorOpen}
                onClose={() => setIsAvatarEditorOpen(false)}
            />
        </div>
    );
};

export default ProfileForm; 