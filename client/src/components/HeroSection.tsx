import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <section className="relative bg-primary py-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Học Tiếng Anh Tại English Center
                    </h1>
                    <p className="text-xl text-white mb-8">
                        Khám phá phương pháp học tiếng Anh hiệu quả với đội ngũ giảng viên chuyên nghiệp
                        và môi trường học tập hiện đại
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-8 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-100 transition-colors"
                        >
                            Xem Khóa Học
                        </button>
                        <button
                            onClick={() => navigate('/contact')}
                            className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white hover:text-primary transition-colors"
                        >
                            Liên Hệ Tư Vấn
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection; 