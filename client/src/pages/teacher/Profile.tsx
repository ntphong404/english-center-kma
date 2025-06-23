import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, BookOpen, Award, Calendar } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';

const TeacherProfile = () => {
    // Mock data - sẽ thay bằng API sau
    const [profile, setProfile] = useState({
        fullName: 'Trần Thị Giáo Viên',
        email: 'teacher@school.com',
        phone: '0987654321',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        dateOfBirth: '1985-05-15',
        avatar: '',
        bio: 'Giáo viên Toán với 8 năm kinh nghiệm giảng dạy, chuyên về Toán học cấp THCS.'
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
                    <p className="text-sm text-muted-foreground">2018-09-01</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Vai trò</p>
                    <p className="text-sm text-muted-foreground">TEACHER</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Khoa</p>
                    <p className="text-sm text-muted-foreground">Khoa Toán</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
                <Award className="w-4 h-4 text-muted-foreground" />
                <div>
                    <p className="text-sm font-medium">Kinh nghiệm</p>
                    <p className="text-sm text-muted-foreground">8 năm</p>
                </div>
            </div>
        </>
    );

    const extraSections = (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Thông tin chuyên môn
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bằng cấp</label>
                        <input
                            value="Thạc sĩ Toán học - Đại học Sư phạm TP.HCM"
                            disabled
                            className="w-full px-3 py-2 border rounded-md bg-muted"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Kinh nghiệm</label>
                        <input
                            value="8 năm"
                            disabled
                            className="w-full px-3 py-2 border rounded-md bg-muted"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Môn học phụ trách</label>
                    <div className="flex flex-wrap gap-2">
                        {['Toán 6', 'Toán 7', 'Toán 8'].map((subject, index) => (
                            <Badge key={index} variant="outline">
                                {subject}
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <ProfileForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onAvatarUpdate={handleAvatarUpdate}
            role="TEACHER"
            roleIcon={<GraduationCap className="w-4 h-4" />}
            additionalInfo={additionalInfo}
            extraSections={extraSections}
        />
    );
};

export default TeacherProfile; 