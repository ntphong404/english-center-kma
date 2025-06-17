import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('user');
        toast({
            title: "Đăng xuất thành công",
            description: "Bạn đã đăng xuất khỏi hệ thống",
        });
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <a href="/" className="text-xl font-bold text-primary">English Center</a>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user.id ? (
                            <>
                                <span className="text-gray-700">Xin chào, {user.name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-4 py-2 text-sm text-primary border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    Đăng ký
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header; 