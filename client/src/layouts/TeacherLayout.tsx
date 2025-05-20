import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Settings,
} from 'lucide-react';
import BaseLayout from './BaseLayout';

const TeacherLayout = () => {
  const sidebarLinks = [
    { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', path: '/teacher/dashboard' },
    { icon: <BookOpen size={18} />, label: 'Lớp học', path: '/teacher/classes' },
    { icon: <Calendar size={18} />, label: 'Lịch giảng dạy', path: '/teacher/schedule' },
    { icon: <ClipboardCheck size={18} />, label: 'Điểm danh', path: '/teacher/attendance' },
    { icon: <Settings size={18} />, label: 'Cài đặt', path: '/teacher/settings' },
  ];

  return (
    <BaseLayout
      title="Teacher Dashboard"
      logo="EC Teacher"
      collapsedLogo="EC"
      sidebarLinks={sidebarLinks}
    />
  );
};

export default TeacherLayout;

