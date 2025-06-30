import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronDown } from 'lucide-react';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { SidebarMenuButtonWithClose } from '@/components/ui/sidebar-menu-button';
import LogoutButton from '@/components/LogoutButton';
import AvatarMenu from '@/components/AvatarMenu';
import { getUser } from '@/store/userStore';

interface SidebarLink {
    icon: React.ReactNode;
    label: string;
    path: string;
}

interface BaseLayoutProps {
    title: string;
    logo: string;
    collapsedLogo: string;
    sidebarLinks: SidebarLink[];
}

const SidebarLogo = ({ logo, collapsedLogo }: { logo: string; collapsedLogo: string }) => {
    const { state } = useSidebar();

    return (
        <Link to="/" className="flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
                {state === "collapsed" ? collapsedLogo : logo}
            </span>
        </Link>
    );
};

const BaseLayout = ({ title, logo, collapsedLogo, sidebarLinks }: BaseLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 w-full">
                <Sidebar side="left" variant="sidebar" collapsible="icon">
                    <SidebarHeader className="p-4 border-b flex justify-center min-h-[60px] items-center">
                        <SidebarLogo logo={logo} collapsedLogo={collapsedLogo} />
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarMenu>
                            {sidebarLinks.map((link, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButtonWithClose
                                        to={link.path}
                                        isActive={isActive(link.path)}
                                        tooltip={link.label}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-6 h-6">
                                                {link.icon}
                                            </div>
                                            <span>{link.label}</span>
                                        </div>
                                    </SidebarMenuButtonWithClose>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarContent>

                    <SidebarFooter className="mt-auto border-t p-4">
                        <div className="flex items-center justify-center">
                            <LogoutButton inSidebar={true} />
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 flex flex-col">
                    <header className="bg-white shadow-sm p-4 flex justify-between items-center h-[60px] min-h-[60px]">
                        <div className="flex items-center">
                            <SidebarTrigger className="mr-2" />
                            <h1 className="text-xl font-semibold">{title}</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <AvatarMenu />
                        </div>
                    </header>

                    <div className="flex-1 p-6">
                        <Outlet />
                    </div>

                    <footer className="bg-white p-4 text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} English Center
                    </footer>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default BaseLayout; 