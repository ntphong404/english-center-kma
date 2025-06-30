import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, LayoutDashboard, User } from "lucide-react"
import authApi from '@/api/authApi';
import { toast } from '@/hooks/use-toast';
import { getUser, removeUser, useUserDataListener } from '@/store/userStore';
import { User as UserType } from '@/types/user';

const AvatarMenu = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [triggerWidth, setTriggerWidth] = useState<number>(0);
    const [userData, setUserData] = useState<{
        usernameInitial: string;
        fullName: string;
        role: string;
        avatarUrl: string;
    } | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    // Callback để cập nhật user data
    const updateUserData = useCallback((user: UserType | null) => {
        if (user) {
            setUserData({
                usernameInitial: user.username.charAt(0).toUpperCase(),
                fullName: user.fullName || user.username,
                role: user.role.toLowerCase(),
                avatarUrl: user.avatarUrl || ""
            });
        } else {
            setUserData(null);
        }
    }, []);

    // Lắng nghe thay đổi user data
    useUserDataListener(updateUserData);

    useEffect(() => {
        if (triggerRef.current && userData) {
            setTriggerWidth(triggerRef.current.offsetWidth);
        }
    }, [userData?.fullName]); // cập nhật khi tên người dùng thay đổi

    const handleLogout = () => {
        authApi.logout({
            accessToken: localStorage.getItem('accessToken') || '',
            refreshToken: localStorage.getItem('refreshToken') || '',
        });
        toast({
            title: "Đăng xuất thành công",
            description: "Bạn đã đăng xuất khỏi hệ thống",
        });
        removeUser();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setMenuOpen(false);
        navigate('/');
    };

    const handleNavigate = (path: string) => {
        setMenuOpen(false);
        navigate(path);
    };

    const handleProfileClick = () => {
        let profilePath = '';
        const user = getUser();
        if (user) {
            switch (user.role) {
                case 'ADMIN':
                    profilePath = '/admin/profile';
                    break;
                case 'TEACHER':
                    profilePath = '/teacher/profile';
                    break;
                case 'STUDENT':
                    profilePath = '/student/profile';
                    break;
                case 'PARENT':
                    profilePath = '/parent/profile';
                    break;
                default:
                    profilePath = '/profile';
            }
            handleNavigate(profilePath);
        }
    };

    // Nếu không có user data, không render gì
    if (!userData) {
        return null;
    }

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <div
                    ref={triggerRef}
                    className="flex items-center justify-between gap-2 cursor-pointer px-3 py-2 rounded-md border border-border bg-background hover:bg-muted transition min-w-[160px]"
                >
                    <Avatar className="h-6 w-6">
                        {userData.avatarUrl ? (
                            <AvatarImage src={userData.avatarUrl} alt={userData.fullName} />
                        ) : (
                            <AvatarFallback>{userData.usernameInitial}</AvatarFallback>
                        )}
                    </Avatar>
                    <span className="text-sm font-medium flex-1 ml-2">{userData.fullName}</span>
                    <ChevronUpDownIcon className="w-4 h-4 text-muted-foreground ml-auto" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                style={{ width: triggerWidth }}
                className="p-1 rounded-md"
            >
                <DropdownMenuItem
                    onClick={() => handleNavigate(`/${userData.role}/dashboard`)}
                    className="h-8 px-3 text-sm"
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleProfileClick}
                    className="h-8 px-3 text-sm"
                >
                    <User className="w-4 h-4 mr-2" />
                    Trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="h-8 px-3 text-sm"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>

        </DropdownMenu>
    );
};

export default AvatarMenu;
