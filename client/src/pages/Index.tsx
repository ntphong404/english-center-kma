import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/LoginForm';
import HomeSlider from '@/components/HomeSlider';
import AboutSection from '@/components/AboutSection';
import RegisterForm from '@/components/RegisterForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">English Center</h1>
          <nav>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Đăng nhập
              </Button>
            </Link>
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
