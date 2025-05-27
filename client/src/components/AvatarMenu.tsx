import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const AvatarMenu = ({ usernameInitial, role }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        setMenuOpen(false);
        navigate('/login');
    };

    const handleNavigate = (path: string) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={toggleMenu} className="flex items-center focus:outline-none">
                <Avatar>
                    <AvatarFallback>{usernameInitial}</AvatarFallback>
                </Avatar>
                <ChevronDownIcon className="w-5 h-5 ml-2 text-gray-500" />
            </button>
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                    <button
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleNavigate(`/${role}/dashboard`)}
                    >
                        Dashboard
                    </button>
                    <button
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </button>
                </div>
            )}
        </div>
    );
};

export default AvatarMenu; 