import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { removeUser } from '@/store/userStore';
import { useSidebar } from '@/components/ui/sidebar';

interface LogoutButtonProps {
    variant?: 'ghost' | 'outline';
    size?: 'default' | 'sm';
    className?: string;
    inSidebar?: boolean;
}

const LogoutButton = ({ variant = 'ghost', size = 'default', className = '', inSidebar = false }: LogoutButtonProps) => {
    const { state } = useSidebar();
    const navigate = useNavigate();

    const handleLogout = () => {
        removeUser();
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('token');
        toast({
            title: 'Đăng xuất thành công',
            description: 'Bạn đã đăng xuất khỏi hệ thống',
        });
        navigate('/');
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={`flex items-center ${inSidebar ? (state === "collapsed" ? "justify-center w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50" : "justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-50") : "justify-start w-full"} ${className}`}
            onClick={handleLogout}
        >
            <LogOut size={size === 'sm' ? 16 : 18} className={inSidebar && state !== "collapsed" ? "mr-3" : ""} />
            {(!inSidebar || state !== "collapsed") && <span>Đăng xuất</span>}
        </Button>
    );
};

export default LogoutButton;

// interface LogoutButtonProps {
//     variant?: 'ghost' | 'outline';
//     size?: 'default' | 'sm';
//     className?: string;
//     showText?: boolean;
// }
// export const LogoutButton = ({
//     variant = 'ghost',
//     size = 'default',
//     className = '',
//     showText = true
// }: LogoutButtonProps) => {
//     const navigate = useNavigate();
//     const { state } = useSidebar();

//     const handleLogout = () => {
//         // Xóa thông tin user
//         removeUser();
//         // Xóa token
//         localStorage.removeItem('token');

//         toast({
//             title: 'Đăng xuất thành công',
//             description: 'Bạn đã đăng xuất khỏi hệ thống',
//         });

//         navigate('/login');
//     };

//     const isCollapsed = state === "collapsed";
//     const shouldShowText = showText && !isCollapsed;

//     return (
//         <Button
//             variant={variant}
//             size={size}
//             className={`flex items-center
//         ${variant === 'ghost'
//                     ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
//                     : ''}
//         ${isCollapsed && variant === 'ghost'
//                     ? 'w-8 h-8 p-0 justify-center'
//                     : 'justify-start px-4 w-full'}
//         ${className}`}
//             onClick={handleLogout}
//         >
//             <LogOut
//                 size={size === 'sm' ? 16 : 18}
//                 className={`${shouldShowText ? 'mr-2' : ''}`}
//             />
//             {shouldShowText && <span>Đăng xuất</span>}
//         </Button>
//     );

// };