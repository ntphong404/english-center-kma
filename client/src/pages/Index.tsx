import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/LoginForm';
import HomeSlider from '@/components/HomeSlider';
import AboutSection from '@/components/AboutSection';
import RegisterForm from '@/components/RegisterForm';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import AvatarMenu from '@/components/AvatarMenu';
import authApi from '@/api/authApi';

const Index = () => {
  const [userData, setUserData] = useState<{
    usernameInitial: string;
    fullName: string;
    role: string;
  } | null>(null);

  const updateUserData = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserData({
          usernameInitial: parsedUser.username.charAt(0).toUpperCase(),
          fullName: parsedUser.fullName,
          role: parsedUser.role.toLowerCase()
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  };

  useEffect(() => {
    updateUserData();
  }, [userData]);

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

  const handleLogout = async () => {
    try {
      // Clear user data first
      setUserData(null);

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Call logout API
      await authApi.logout({
        accessToken: localStorage.getItem('accessToken') || '',
        refreshToken: localStorage.getItem('refreshToken') || '',
      });

      // Force a re-render
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we still want to clear local data
      setUserData(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">English Center</h1>
          <nav>
            {userData ? (
              <AvatarMenu
                usernameInitial={userData.usernameInitial}
                role={userData.role}
                fullName={userData.fullName}
              />
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section with Slider */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <HomeSlider />
          </div>
        </section>

        {/* About Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <AboutSection />
          </div>
        </section>

        {/* Register Form */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 max-w-md">
            <h2 className="text-2xl font-bold text-center mb-8">Đăng ký nhận thông tin lớp mới</h2>
            <RegisterForm />
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">English Center</h3>
              <p>Trung tâm dạy tiếng Anh chất lượng cao</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
              <p>Địa chỉ: 123 Đường ABC, Quận XYZ</p>
              <p>Điện thoại: 0123 456 789</p>
              <p>Email: info@englishhubconnect.com</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Theo dõi chúng tôi</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-primary">Facebook</a>
                <a href="#" className="hover:text-primary">Zalo</a>
                <a href="#" className="hover:text-primary">Instagram</a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; {new Date().getFullYear()} English Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
