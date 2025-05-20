import React from 'react';
import { useCloseSidebar } from "@/hooks/use-close-sidebar";
import { SidebarMenuButton } from "./sidebar";
import { useNavigate } from "react-router-dom";

interface SidebarMenuButtonProps extends React.ComponentProps<typeof SidebarMenuButton> {
    to?: string;
}

export const SidebarMenuButtonWithClose = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
    ({ to, children, ...props }, ref) => {
        const closeSidebar = useCloseSidebar();
        const navigate = useNavigate();

        const handleClick = () => {
            closeSidebar();
            if (to) {
                navigate(to);
            }
        };

        return (
            <SidebarMenuButton ref={ref} onClick={handleClick} {...props}>
                {children}
            </SidebarMenuButton>
        );
    }
);

SidebarMenuButtonWithClose.displayName = "SidebarMenuButtonWithClose"; 