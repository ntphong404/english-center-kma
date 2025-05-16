import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardCheck,
  Settings,
  LogOut,
  Menu,
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

const SidebarLogo = () => {
  const { state } = useSidebar();

  return (
    <Link to="/teacher/dashboard" className="flex items-center justify-center">
      <span className="text-xl font-bold text-primary">
        {state === "collapsed" ? "EC" : "EC Teacher"}
      </span>
    </Link>
  );
};

const LogoutButton = () => {
  const { state } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({
      title: 'Đăng xuất thành công',
      description: 'Bạn đã đăng xuất khỏi hệ thống',
    });
    navigate('/');
  };

  return (
    <Button
      variant="ghost"
      className={`flex items-center ${state === "collapsed" ? "justify-center w-8 h-8" : "justify-start w-full"} text-red-500 hover:text-red-600 hover:bg-red-50`}
      onClick={handleLogout}
    >
      <LogOut size={18} className={state === "collapsed" ? "" : "mr-3"} />
      {state !== "collapsed" && <span>Đăng xuất</span>}
    </Button>
  );
};

const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarLinks = [
    { icon: <LayoutDashboard size={18} />, label: 'Tổng quan', path: '/teacher/dashboard' },
    { icon: <Users size={18} />, label: 'Lớp học của tôi', path: '/teacher/classes' },
    { icon: <Calendar size={18} />, label: 'Lịch dạy', path: '/teacher/schedule' },
    { icon: <ClipboardCheck size={18} />, label: 'Điểm danh', path: '/teacher/attendance' },
    { icon: <Settings size={18} />, label: 'Cài đặt', path: '/teacher/settings' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 w-full">
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarHeader className="p-4 border-b flex justify-center">
            <SidebarLogo />
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {sidebarLinks.map((link, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(link.path)}
                    tooltip={link.label}
                  >
                    <Link to={link.path} className="flex items-center space-x-3">
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="mt-auto border-t p-4">
            <LogoutButton />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm p-4 flex justify-between items-center">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/')} className="hidden md:flex">
                <LogOut size={16} className="mr-2" /> Đăng xuất
              </Button>
            </div>
          </header>

          <div className="flex-1 p-6">
            <Outlet />
          </div>

          <footer className="bg-white p-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} English Center - Teacher Panel
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default TeacherLayout;

