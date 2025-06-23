import React, { useState } from 'react';
import { GraduationCap, Users, BookOpen, Calendar } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';

const StudentProfile = () => {
    // Mock data - sẽ thay bằng API sau
    const [profile, setProfile] = useState({
        fullName: 'Lê Văn Học Sinh',
        email: 'student@school.com',
        phoneNumber: '0123456789',
        address: '789 Đường DEF, Quận 3, TP.HCM',
        dateOfBirth: '2010-03-20',
        avatar: '',
        bio: 'Học sinh lớp 8A, yêu thích môn Toán và Văn học.'
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
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Ngày nhập học</p>
                    <p className="text-sm text-muted-foreground">2020-09-01</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Lớp</p>
                    <p className="text-sm text-muted-foreground">Lớp 8A</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Mã học sinh</p>
                    <p className="text-sm text-muted-foreground">HS2024001</p>
                </div>
            </div>
        </>
    );

    const extraSections = (
        <div>
            <div className="mb-4">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Thông tin phụ huynh</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Họ tên phụ huynh</span>
                        <input value="Lê Văn Phụ Huynh" disabled className="w-full px-3 py-2 border rounded-md bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Số điện thoại phụ huynh</span>
                        <input value="0987654321" disabled className="w-full px-3 py-2 border rounded-md bg-muted" />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <ProfileForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onAvatarUpdate={handleAvatarUpdate}
            role="STUDENT"
            roleIcon={<GraduationCap className="w-4 h-4" />}
            additionalInfo={additionalInfo}
            extraSections={extraSections}
        />
    );
};

export default StudentProfile; 