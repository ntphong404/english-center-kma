import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    Calendar,
    DollarSign,
    Settings,
    LogOut,
    Menu,
    CreditCard,
    BookOpen,
    Clock,
    MessageSquare,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import BaseLayout from './BaseLayout';

const SidebarLogo = () => {
    const { state } = useSidebar();

    return (
        <Link to="/parent/dashboard" className="flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
                {state === "collapsed" ? "EC" : "EC Parent"}
            </span>
        </Link>
    );
};

const ParentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const sidebarLinks = [
        { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', path: '/parent/dashboard' },
        { icon: <Users size={18} />, label: 'Quản lý con', path: '/parent/children' },
        { icon: <Calendar size={18} />, label: 'Lịch học', path: '/parent/schedule' },
        { icon: <Clock size={18} />, label: 'Thời khóa biểu', path: '/parent/timetable' },
        { icon: <BookOpen size={18} />, label: 'Lớp học', path: '/parent/classes' },
        { icon: <DollarSign size={18} />, label: 'Học phí', path: '/parent/fees' },
        { icon: <Settings size={18} />, label: 'Cài đặt', path: '/parent/settings' },
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <BaseLayout
            title="Parent Dashboard"
            logo="EC Parent"
            collapsedLogo="EC"
            sidebarLinks={sidebarLinks}
        />
    );
};

export default ParentLayout; 