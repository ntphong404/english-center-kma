import React, { useState, useEffect } from 'react';
import { Users, Baby, Calendar, Heart, PhoneIncoming } from 'lucide-react';
import ProfileForm from '@/components/ProfileForm';
import parentApi from '@/api/parentApi';
import studentApi from '@/api/studentApi';

const ParentProfile = () => {
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        dateOfBirth: '',
        avatar: '',
        bio: '',
    });
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const user = localStorage.getItem('user');
                if (!user) return;
                const { userId } = JSON.parse(user);
                const parentRes = await parentApi.getById(userId);
                const parent = parentRes.data.result;
                setProfile({
                    fullName: parent.fullName,
                    email: parent.email,
                    phoneNumber: parent.phoneNumber,
                    address: parent.address,
                    dateOfBirth: parent.dob,
                    avatar: parent.avatarUrl,
                    bio: '',
                });
                if (parent.studentIds && parent.studentIds.length > 0) {
                    const stuRes = await studentApi.getByIds(parent.studentIds);
                    setChildren(stuRes.data.result || []);
                } else {
                    setChildren([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

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
                    <p className="text-sm text-muted-foreground">{children.length} con</p>
                </div>
            </div>
        </>
    );

    const extraSections = (
        <div>
            <div className="mb-4">
                <h2 className="font-semibold mb-2 flex items-center gap-2"><Baby className="w-4 h-4" /> Thông tin con em</h2>
                <div className="space-y-2">
                    {children.map(child => (
                        <div key={child.userId} className="p-4 border rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">{child.fullName || child.username}</h4>
                                <p className="text-sm text-muted-foreground">Email: {child.email || '-'}</p>
                            </div>
                            <span className="flex items-center gap-1 text-xs"><Heart className="w-3 h-3" /> Con</span>
                        </div>
                    ))}
                    {children.length === 0 && <div className="text-muted-foreground text-sm">Chưa có thông tin học sinh</div>}
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