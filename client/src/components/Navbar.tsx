import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-primary">English Center</Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/about" className="text-gray-700 hover:text-primary">Về Chúng Tôi</Link>
                        <Link to="/courses" className="text-gray-700 hover:text-primary">Khóa Học</Link>
                        <Link to="/teachers" className="text-gray-700 hover:text-primary">Giảng Viên</Link>
                        <Link to="/contact" className="text-gray-700 hover:text-primary">Liên Hệ</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-primary focus:outline-none"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link
                                to="/about"
                                className="block px-3 py-2 text-gray-700 hover:text-primary"
                                onClick={toggleMenu}
                            >
                                Về Chúng Tôi
                            </Link>
                            <Link
                                to="/courses"
                                className="block px-3 py-2 text-gray-700 hover:text-primary"
                                onClick={toggleMenu}
                            >
                                Khóa Học
                            </Link>
                            <Link
                                to="/teachers"
                                className="block px-3 py-2 text-gray-700 hover:text-primary"
                                onClick={toggleMenu}
                            >
                                Giảng Viên
                            </Link>
                            <Link
                                to="/contact"
                                className="block px-3 py-2 text-gray-700 hover:text-primary"
                                onClick={toggleMenu}
                            >
                                Liên Hệ
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 