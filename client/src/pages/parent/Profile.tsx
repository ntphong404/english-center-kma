import React, { useState } from 'react';
import { Users, Baby, Calendar, Heart, PhoneIncoming } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';

const ParentProfile = () => {
    // Mock data - sẽ thay bằng API sau
    const [profile, setProfile] = useState({
        fullName: 'Nguyễn Thị Phụ Huynh',
        email: 'parent@school.com',
        phoneNumber: '0123456789',
        address: '321 Đường GHI, Quận 4, TP.HCM',
        dateOfBirth: '1980-07-10',
        avatar: '',
        bio: 'Phụ huynh quan tâm đến việc học tập của con em.'
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
                    <p className="text-sm font-medium">Ngày tham gia</p>
                    <p className="text-sm text-muted-foreground">2020-09-01</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Vai trò</p>
                    <p className="text-sm text-muted-foreground">PARENT</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Baby className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Số con</p>
                    <p className="text-sm text-muted-foreground">2 con</p>
                </div>
            </div>
        </>
    );

    const extraSections = (
        <div>
            <div className="mb-4">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><Baby className="w-4 h-4" /> Thông tin con em</h2>
                <div className="space-y-2">
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Nguyễn Văn Con 1</h4>
                            <p className="text-sm text-muted-foreground">Lớp 8A - HS2024001</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs"><Heart className="w-3 h-3" /> Con</span>
                    </div>
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Nguyễn Thị Con 2</h4>
                            <p className="text-sm text-muted-foreground">Lớp 6B - HS2024002</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs"><Heart className="w-3 h-3" /> Con</span>
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
            role="PARENT"
            roleIcon={<Users className="w-4 h-4" />}
            additionalInfo={additionalInfo}
            extraSections={extraSections}
        />
    );
};

export default ParentProfile; 