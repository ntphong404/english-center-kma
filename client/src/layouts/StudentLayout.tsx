import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardCheck,
  DollarSign,
  Settings,
} from 'lucide-react';
import BaseLayout from './BaseLayout';

const StudentLayout = () => {
  const sidebarLinks = [
    { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', path: '/student/dashboard' },
    { icon: <Calendar size={18} />, label: 'Lịch học', path: '/student/schedule' },
    { icon: <ClipboardCheck size={18} />, label: 'Điểm danh', path: '/student/attendance' },
    { icon: <Settings size={18} />, label: 'Cài đặt', path: '/student/settings' },
  ];

  return (
    <BaseLayout
      title="Student Dashboard"
      logo="EC Student"
      collapsedLogo="EC"
      sidebarLinks={sidebarLinks}
    />
  );
};

export default StudentLayout;
