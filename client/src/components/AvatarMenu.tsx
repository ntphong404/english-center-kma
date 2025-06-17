import React, { useState, useEffect, useRef } from 'react';
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
import { LogOut, LayoutDashboard } from "lucide-react"
import authApi from '@/api/authApi';
import { toast } from '@/hooks/use-toast';

const AvatarMenu = ({ usernameInitial, role, fullName, avatarUrl = "" }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [triggerWidth, setTriggerWidth] = useState<number>(0);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (triggerRef.current) {
            setTriggerWidth(triggerRef.current.offsetWidth);
        }
    }, [fullName]); // cập nhật khi tên người dùng thay đổi

    const handleLogout = () => {
        authApi.logout({
            accessToken: localStorage.getItem('accessToken') || '',
            refreshToken: localStorage.getItem('refreshToken') || '',
        });
        toast({
            title: "Đăng xuất thành công",
            description: "Bạn đã đăng xuất khỏi hệ thống",
        });
        setMenuOpen(false);
        navigate('/');
    };

    const handleNavigate = (path: string) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <div
                    ref={triggerRef}
                    className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border border-border bg-background hover:bg-muted transition"
                >
                    <Avatar className="h-6 w-6">
                        {avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt={fullName} />
                        ) : (
                            <AvatarFallback>{usernameInitial}</AvatarFallback>
                        )}
                    </Avatar>
                    <span className="text-sm font-medium">{fullName}</span>
                    <ChevronUpDownIcon className="w-4 h-4 text-muted-foreground" />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                style={{ width: triggerWidth }}
                className="p-1 rounded-md"
            >
                <DropdownMenuItem
                    onClick={() => handleNavigate(`/${role}/dashboard`)}
                    className="h-8 px-3 text-sm"
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
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
