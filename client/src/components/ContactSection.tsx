import React from 'react';

const ContactSection = () => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Liên Hệ English Center</h2>

                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Thông Tin Liên Hệ</h3>
                            <div className="space-y-4">
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Địa chỉ:</span>
                                    123 Đường ABC, Quận XYZ, TP. HCM
                                </p>
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Điện thoại:</span>
                                    (028) 1234 5678
                                </p>
                                <p className="flex items-center">
                                    <span className="font-medium mr-2">Email:</span>
                                    info@englishcenter.com
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-4">Giờ Làm Việc</h3>
                            <div className="space-y-2">
                                <p>Thứ 2 - Thứ 6: 8:00 - 21:00</p>
                                <p>Thứ 7: 8:00 - 17:00</p>
                                <p>Chủ nhật: 8:00 - 12:00</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-lg font-medium mb-4">English Center - Trung tâm Anh ngữ hàng đầu</p>
                        <p className="text-gray-600">
                            Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection; 