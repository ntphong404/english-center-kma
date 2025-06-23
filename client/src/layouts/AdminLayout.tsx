import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  DollarSign,
  BarChart,
  Bell,
  Settings,
  Image,
} from 'lucide-react';
import BaseLayout from './BaseLayout';

const AdminLayout = () => {
  const sidebarLinks = [
    { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', path: '/admin/dashboard' },
    { icon: <BookOpen size={18} />, label: 'Lớp học', path: '/admin/classes' },
    { icon: <Users size={18} />, label: 'Quản lý người dùng', path: '/admin/users' },
    { icon: <DollarSign size={18} />, label: 'Quản lý học phí', path: '/admin/fees' },
    { icon: <BarChart size={18} />, label: 'Báo cáo thống kê', path: '/admin/reports' },
    { icon: <Image size={18} />, label: 'Banner', path: '/admin/banner' },
    { icon: <Bell size={18} />, label: 'Gửi thông báo', path: '/admin/notifications' },
    { icon: <Settings size={18} />, label: 'Cài đặt', path: '/admin/settings' },
  ];

  return (
    <BaseLayout
      title="Admin Dashboard"
      logo="EC Admin"
      collapsedLogo="EC"
      sidebarLinks={sidebarLinks}
    />
  );
};

export default AdminLayout;

