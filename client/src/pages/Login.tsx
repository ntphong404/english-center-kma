import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '@/components/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-primary">English Center</Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <LoginForm />

          <div className="text-center mt-6">
            <Link to="/" className="text-primary hover:underline">
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} English Center. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
