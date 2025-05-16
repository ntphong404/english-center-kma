import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: keyof typeof Icons;
}

interface SidebarProps {
    navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
    const location = useLocation();

    return (
        <div className="w-64 min-h-screen border-r bg-background">
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const IconComponent = Icons[item.icon] as React.ComponentType<{ className?: string }>;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                                        location.pathname === item.href
                                            ? "bg-accent"
                                            : "transparent"
                                    )}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
} 