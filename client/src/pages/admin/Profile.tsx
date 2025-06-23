import React, { useState } from 'react';
import { Shield, Settings } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';

const AdminProfile = () => {
    // Mock data - sẽ thay bằng API sau
    const [profile, setProfile] = useState({
        fullName: 'Nguyễn Văn Admin',
        email: 'admin@school.com',
        phoneNumber: '0123456789',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        dateOfBirth: '1990-01-01',
        avatar: '',
        bio: 'Quản trị viên hệ thống với 5 năm kinh nghiệm trong lĩnh vực giáo dục.'
    });

    const handleProfileUpdate = (data: any) => {
        setProfile(data);
        // TODO: Gọi API cập nhật thông tin
    };

    const handleAvatarUpdate = (file: File) => {
        // TODO: Gọi API upload avatar
        console.log('Upload avatar:', file);
    };

    const additionalInfo = (
        <>
            <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Vai trò</p>
                    <p className="text-sm text-muted-foreground">ADMIN</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Phòng ban</p>
                    <p className="text-sm text-muted-foreground">Quản lý hệ thống</p>
                </div>
            </div>
        </>
    );

    return (
        <ProfileForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onAvatarUpdate={handleAvatarUpdate}
            role="ADMIN"
            roleIcon={<Shield className="w-4 h-4" />}
            additionalInfo={additionalInfo}
        />
    );
};

export default AdminProfile; 