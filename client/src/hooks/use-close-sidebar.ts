import { useSidebar } from "@/components/ui/sidebar";

export const useCloseSidebar = () => {
    const { isMobile, setOpenMobile } = useSidebar();

    const closeSidebar = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    return closeSidebar;
}; 