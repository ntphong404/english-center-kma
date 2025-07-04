import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { getUser, useUserDataListener } from '@/store/userStore';
import { User } from '@/types/user';

// Thêm animation CSS vào đầu file hoặc import vào project nếu chưa có
// .animate-fade-in { animation: fadeIn 0.3s ease; }
// .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1); }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
// @keyframes scaleIn { from { opacity: 0; transform: scale(0.95);} to { opacity: 1; transform: scale(1);} }

// Danh sách giáo viên tiểu học (1-5)
const teachers = [
  {
    name: "Cô Nguyễn Thu Hà",
    role: "Giáo viên Tiếng Anh lớp 1",
    avatar: "/src/assets/images/index/gv_nu_1.png",
    profile: [
      "Tốt nghiệp loại giỏi Đại học Sư phạm Hà Nội",
      "Chứng chỉ IELTS 8.0 overall",
      "5 năm kinh nghiệm giảng dạy Tiếng Anh tiểu học",
      "Đạt giải Nhì giáo viên dạy giỏi cấp Quận",
      "Phương pháp dạy học sáng tạo, truyền cảm hứng cho học sinh"
    ]
  },
  {
    name: "Cô Lê Thị Mai",
    role: "Giáo viên Tiếng Anh lớp 2",
    avatar: "/src/assets/images/index/gv_nu_2.png",
    profile: [
      "Tốt nghiệp xuất sắc Đại học Sư phạm TP.HCM",
      "Chứng chỉ Cambridge TKT",
      "6 năm kinh nghiệm giảng dạy Tiếng Anh cấp 1",
      "Được học sinh yêu mến bởi sự tận tâm và sáng tạo",
      "Tác giả nhiều tài liệu luyện phát âm cho học sinh tiểu học"
    ]
  },
  {
    name: "Cô Phạm Thị Hồng",
    role: "Giáo viên Tiếng Anh lớp 3",
    avatar: "/src/assets/images/index/gv_nu_3.png",
    profile: [
      "Tốt nghiệp Đại học Sư phạm Ngoại ngữ",
      "Chứng chỉ TESOL",
      "7 năm kinh nghiệm giảng dạy Tiếng Anh tiểu học",
      "Đạt nhiều thành tích trong công tác bồi dưỡng học sinh giỏi",
      "Phong cách dạy học vui nhộn, gần gũi với học sinh"
    ]
  },
  {
    name: "Thầy Trần Minh Quân",
    role: "Giáo viên Tiếng Anh lớp 4",
    avatar: "/src/assets/images/index/gv_nam_1.png",
    profile: [
      "Tốt nghiệp Đại học Ngoại ngữ - ĐHQGHN",
      "Chứng chỉ TESOL quốc tế",
      "4 năm kinh nghiệm giảng dạy Tiếng Anh trẻ em",
      "Đạt giải Ba giáo viên trẻ xuất sắc thành phố",
      "Chuyên gia xây dựng chương trình học tương tác cho học sinh nhỏ tuổi"
    ]
  },
  {
    name: "Thầy Nguyễn Văn Dũng",
    role: "Giáo viên Tiếng Anh lớp 5",
    avatar: "/src/assets/images/index/gv_nam_2.png",
    profile: [
      "Tốt nghiệp Đại học Hà Nội",
      "Chứng chỉ IELTS 7.5",
      "8 năm kinh nghiệm giảng dạy Tiếng Anh thiếu nhi",
      "Đạt giải Khuyến khích giáo viên sáng tạo toàn quốc",
      "Chuyên gia tổ chức hoạt động ngoại khoá bằng tiếng Anh"
    ]
  }
];

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Callback để cập nhật trạng thái đăng nhập
  const updateLoginState = useCallback((user: User | null) => {
    setIsLoggedIn(!!user);
  }, []);

  // Lắng nghe thay đổi user data
  useUserDataListener(updateLoginState);

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
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    }
  };

  const [showConsultModal, setShowConsultModal] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowConsultModal(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const [selectedTeacher, setSelectedTeacher] = useState(0);

  // Scroll-to-top button state
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-xl fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">English Center</h1>
          <nav>
            {isLoggedIn ? (
              <AvatarMenu />
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

      <main className="pt-20">
        {/* Hero Section with Slider */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <HomeSlider />
          </div>
        </section>

        {/* Section: Giới thiệu & Phương pháp học */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-4">Trung tâm Anh ngữ English Center</h2>
            <p className="text-lg mb-4">
              Độc quyền phương pháp học tập từ các chuyên gia hàng đầu thế giới. Cam kết giao tiếp trôi chảy sau 3-6 tháng học, đạt mục tiêu điểm số Cambridge/TOEFL/IELTS/TOEIC.
            </p>
            <p>
              Đội ngũ giáo viên giỏi, tận tâm, nhiều năm kinh nghiệm. Lộ trình học cá nhân hóa, tối ưu cho từng học viên.
            </p>
          </div>
        </section>

        {/* Section: Các chương trình học nổi bật */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Các chương trình học nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow p-6 text-center transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary border border-transparent">
                <h3 className="font-bold text-lg mb-2">Tiếng Anh Mầm non</h3>
                <p>Chương trình dành cho trẻ 3-6 tuổi, phát triển nền tảng tiếng Anh vững chắc.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary border border-transparent">
                <h3 className="font-bold text-lg mb-2">Luyện thi IELTS/TOEIC</h3>
                <p>Cam kết đầu ra, luyện thi cùng chuyên gia, cập nhật đề thi mới nhất.</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6 text-center transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary border border-transparent">
                <h3 className="font-bold text-lg mb-2">Tiếng Anh giao tiếp</h3>
                <p>Giao tiếp thực tế, phản xạ nhanh, tự tin sử dụng tiếng Anh trong công việc và cuộc sống.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Cam kết đầu ra & điểm khác biệt */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Cam kết & Điểm khác biệt</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p>Cam kết đầu ra bằng hợp đồng, rõ ràng, minh bạch</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">96%</div>
                <p>Học viên đạt điểm số mục tiêu</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p>Phụ huynh hài lòng với chất lượng đào tạo</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p>Phương pháp học độc quyền, lộ trình cá nhân hóa, hệ thống quản lý học trực tuyến hiện đại.</p>
            </div>
          </div>
        </section>

        {/* Section: Đội ngũ giảng viên Pasal */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Đội ngũ giảng viên</h2>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {teachers.map((teacher, idx) => (
                <div
                  key={teacher.name}
                  className={`flex flex-col items-center cursor-pointer border rounded-xl px-6 py-4 w-48 transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary hover:text-primary ${selectedTeacher === idx ? 'bg-red-50 border-red-400 text-primary' : 'bg-white border-gray-200'}`}
                  onClick={() => setSelectedTeacher(idx)}
                >
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    className="w-24 h-24 rounded-full object-cover border-4 mb-2 border-primary/20"
                  />
                  <div className={`font-semibold text-base ${selectedTeacher === idx ? 'text-primary' : 'text-gray-800'}`}>{teacher.name}</div>
                  <div className="text-sm text-gray-500 mt-1">{teacher.role}</div>
                </div>
              ))}
            </div>
            {/* Thông tin chi tiết giáo viên */}
            <div className="flex flex-col md:flex-row gap-8 items-center bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border border-primary/20">
              <img
                src={teachers[selectedTeacher].avatar}
                alt={teachers[selectedTeacher].name}
                className="w-40 h-40 rounded-full object-cover border-4 border-primary/30 mb-4 md:mb-0"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1 text-primary">{teachers[selectedTeacher].name}</h3>
                <div className="text-lg text-gray-700 mb-2">{teachers[selectedTeacher].role}</div>
                <ul className="list-none space-y-2 text-gray-700 text-base">
                  {teachers[selectedTeacher].profile.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <button className="px-6 py-2 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition">Xem profile</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Cơ sở vật chất */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Cơ sở vật chất hiện đại</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-100 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary border border-transparent">
                <p>Phòng học rộng rãi, trang thiết bị hiện đại, không gian học tập thân thiện.</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary border border-transparent">
                <p>Hệ thống quản lý học tập trực tuyến, hỗ trợ học viên mọi lúc mọi nơi.</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 text-center transition-all duration-200 hover:shadow-2xl hover:scale-105 hover:border-primary border border-transparent">
                <p>Thư viện tài liệu phong phú, hỗ trợ luyện thi và phát triển kỹ năng toàn diện.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Phương pháp đào tạo */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Phương pháp đào tạo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6 flex flex-col">
                <div className="border rounded-xl p-5 bg-[#fff6f6] border-primary/30">
                  <h3 className="font-bold text-primary mb-2">KHƠI NGUỒN ĐAM MÊ VÀ ĐỘNG LỰC VỚI TIẾNG ANH</h3>
                  <p className="text-gray-700 text-sm">Nguyên lý Pasal Total Immersion giúp bạn "yêu lại từ đầu" với tiếng Anh. Đem lại niềm vui và tái tạo động lực qua trải nghiệm sống động, khai phá đam mê học tiếng Anh bấy lâu bị "vùi lấp". Cảm hứng học tập là nền tảng cốt lõi khi triển khai các bước tiếp theo của phương pháp Pasal Total Immersion.</p>
                </div>
                <div className="border rounded-xl p-5 bg-[#fff6f6] border-primary/30">
                  <h3 className="font-bold text-primary mb-2">CHUẨN NGỮ ÂM VÀ NGỮ ĐIỆU</h3>
                  <p className="text-gray-700 text-sm">Nguyên lý PASAL Total Immersion giúp phát âm giống người bản ngữ. Người học dần nắm vững quy tắc, luyện tập cùng chuyên gia, phát âm chuẩn mực, tự tin sử dụng tiếng Anh như ngôn ngữ thứ hai.</p>
                </div>
                <div className="border rounded-xl p-5 bg-[#fff6f6] border-primary/30">
                  <h3 className="font-bold text-primary mb-2">GHI NHỚ VÀ SỬ DỤNG TỪ VỰNG HIỆU QUẢ</h3>
                  <p className="text-gray-700 text-sm">Học từ vựng tiếng Anh không bao giờ quên nhờ hệ thống ghi nhớ sâu PIMS (Personal Meaning System) và lộ trình luyện tập thực tế, giúp bạn làm chủ từ vựng và các chủ đề mình yêu thích một cách tự nhiên, hiệu quả.</p>
                </div>
                {/* Ảnh minh hoạ bên dưới các box bên trái */}
                <div className="flex-1 flex items-center justify-center mt-4">
                  <img src="/src/assets/images/index/method1.jpg" alt="Mục tiêu học tập" className="max-h-56 w-auto mx-auto rounded-lg shadow" />
                </div>
              </div>
              <div className="flex flex-col gap-6">
                {/* Ảnh minh hoạ bên trên các box bên phải */}
                <div className="flex-1 flex items-center justify-center mb-4">
                  <img src="/src/assets/images/index/method2.png" alt="Quản lý thời gian học tập" className="max-h-56 w-auto mx-auto rounded-lg shadow" />
                </div>
                <div className="border rounded-xl p-5 bg-[#f8fafd] border-primary/10">
                  <h3 className="font-bold text-primary mb-2">SUY NGHĨ VÀ PHẢN XẠ BẰNG TIẾNG ANH</h3>
                  <p className="text-gray-700 text-sm">Tăng tốc phản xạ trong giao tiếp tiếng Anh. Nói tiếng Anh không cần dịch, phản xạ tự nhiên, tư duy như người bản xứ nhờ phương pháp Pasal Total Immersion.</p>
                </div>
                <div className="border rounded-xl p-5 bg-[#f8fafd] border-primary/10">
                  <h3 className="font-bold text-primary mb-2">TỰ TIN GIAO TIẾP BẰNG TIẾNG ANH</h3>
                  <p className="text-gray-700 text-sm">Xoá bỏ sự ngại ngùng và tự tin giao tiếp bằng tiếng Anh. Phương pháp Pasal Total Immersion giúp bạn tự tin thể hiện bản thân bằng tiếng Anh, luyện phản xạ, làm chủ tình huống thực tế.</p>
                </div>
                <div className="border rounded-xl p-5 bg-[#f8fafd] border-primary/10">
                  <h3 className="font-bold text-primary mb-2">MÔI TRƯỜNG THỰC HÀNH</h3>
                  <p className="text-gray-700 text-sm">Môi trường "tắm" tiếng Anh tự nhiên và liên tục. Lộ trình học tập kết hợp trải nghiệm thực tế, hoạt động ngoại khoá, hàng ngày, thực hành liên tục, học viên chủ động hoà nhập và sử dụng tiếng Anh như ngôn ngữ thứ hai.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Ưu đãi, sự kiện, review học viên */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">Ưu đãi & Review học viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold mb-2">Ưu đãi lên tới 40% học phí</h3>
                <p>Đăng ký ngay để nhận ưu đãi hấp dẫn cho các khóa học mới.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {/* Review Card 1 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/Le-Van-An-7.0-IELTS.webp" alt="Nguyễn Văn A" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Nguyễn Văn A - 7.0 IELTS</h4>
                    <p className="text-sm">Reading 7.5, Writing 6.5, Listening 7.0, Speaking 7.0</p>
                    <p className="mt-2 text-sm">"Mình đã đạt IELTS 7.0 sau 6 tháng học tại trung tâm, giáo viên rất tận tâm và nhiệt tình."</p>
                  </div>
                </div>
              </div>
              {/* Review Card 2 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/Tran-Duc-Minh-7.5-IELTS.webp" alt="Trần Thị B" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Trần Thị B - 7.5 IELTS</h4>
                    <p className="text-sm">Reading 8.0, Writing 7.0, Listening 7.5, Speaking 7.5</p>
                    <p className="mt-2 text-sm">"Sau khoá học, mình tự tin giao tiếp tiếng Anh với đồng nghiệp nước ngoài."</p>
                  </div>
                </div>
              </div>
              {/* Review Card 3 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/HOC-VIEN-PASAL-IELTS-1.webp" alt="Lê Minh C" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Lê Minh C - 800 TOEIC</h4>
                    <p className="text-sm">Reading 400, Listening 400</p>
                    <p className="mt-2 text-sm">"Điểm TOEIC tăng từ 500 lên 800 chỉ sau 4 tháng, cảm ơn thầy cô rất nhiều!"</p>
                  </div>
                </div>
              </div>
              {/* Review Card 4 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/HOC-VIEN-PASAL-IELTS-2.webp" alt="Phạm Thảo D" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Phạm Thảo D - 6.5 IELTS</h4>
                    <p className="text-sm">Reading 6.5, Writing 6.0, Listening 7.0, Speaking 6.5</p>
                    <p className="mt-2 text-sm">"Con mình tiến bộ rõ rệt, phát âm chuẩn hơn và rất thích đi học."</p>
                  </div>
                </div>
              </div>
              {/* Review Card 5 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/HOC-VIEN-PASAL-IELTS-3.webp" alt="Ngô Văn E" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Ngô Văn E - 6.0 IELTS</h4>
                    <p className="text-sm">Reading 6.0, Writing 6.0, Listening 6.5, Speaking 5.5</p>
                    <p className="mt-2 text-sm">"Mình đã có thể tự tin thuyết trình bằng tiếng Anh trước lớp."</p>
                  </div>
                </div>
              </div>
              {/* Review Card 6 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/HOC-VIEN-PASAL-IELTS-12.webp" alt="Vũ Thị F" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Vũ Thị F - 6.5 IELTS</h4>
                    <p className="text-sm">Reading 7.0, Writing 6.0, Listening 6.5, Speaking 6.5</p>
                    <p className="mt-2 text-sm">"Thầy cô hỗ trợ rất sát sao, mình đã đạt mục tiêu IELTS 6.5."</p>
                  </div>
                </div>
              </div>
              {/* Review Card 7 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/Anh-hoc-vien-website-26.webp" alt="Đặng Quốc G" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Đặng Quốc G - 800 TOEIC</h4>
                    <p className="text-sm">Reading 400, Listening 400</p>
                    <p className="mt-2 text-sm">"Mình rất hài lòng với môi trường học tập và bạn bè ở đây."</p>
                  </div>
                </div>
              </div>
              {/* Review Card 8 */}
              <div className="bg-white rounded-xl shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:scale-105 flex flex-col items-center">
                <div className="w-full rounded-xl overflow-hidden flex flex-col">
                  <img src="/src/assets/images/index/Anh-hoc-vien-website-29.webp" alt="Lý Thị H" className="w-full h-64 object-cover" />
                  <div className="w-full h-[172px] bg-[#ff4d4f] text-white p-4 text-center flex flex-col justify-center">
                    <h4 className="font-bold text-lg mb-1">Lý Thị H - 7.0 IELTS</h4>
                    <p className="text-sm">Reading 7.0, Writing 7.0, Listening 7.0, Speaking 7.0</p>
                    <p className="mt-2 text-sm">"Trung tâm rất chuyên nghiệp, con mình rất thích các hoạt động ngoại khoá."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="flex justify-center my-12">
          <button
            className="bg-primary text-white font-bold px-8 py-3 rounded-full shadow hover:bg-primary/90 transition"
            onClick={() => setShowConsultModal(true)}
          >
            Đăng ký tư vấn - Trải nghiệm học thử
          </button>
        </div>

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

      {/* Modal tư vấn */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-300 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-0 w-full max-w-2xl relative animate-scale-in border-4 border-[#ff4d4f]">
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-primary text-3xl font-bold z-10"
              onClick={() => setShowConsultModal(false)}
              aria-label="Đóng"
            >
              ×
            </button>
            <div className="px-8 pt-8 pb-2">
              <h2 className="text-3xl font-bold mb-2 text-center text-[#ff4d4f]">HÈ RỘN RÀNG, NGẬP TRÀN ƯU ĐÃI</h2>
              <div className="text-2xl font-bold text-center mb-2 text-gray-800">Đăng ký test trình độ và nhận tư vấn lộ trình miễn phí ngay:</div>
              <div className="text-center text-gray-500 mb-6">Tặng học bổng khoá học lên tới 25% cùng nhiều phần quà hấp dẫn khác</div>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input type="text" placeholder="Họ và Tên: (*)" className="w-full px-5 py-3 rounded-lg border text-lg" />
                <input type="tel" placeholder="Số Điện Thoại: (*)" className="w-full px-5 py-3 rounded-lg border text-lg" />
                <select className="w-full px-5 py-3 rounded-lg border text-lg" defaultValue="">
                  <option value="" disabled>Lựa Chọn Cơ Sở</option>
                  <option value="cs1">Cơ sở 1</option>
                  <option value="cs2">Cơ sở 2</option>
                  <option value="cs3">Cơ sở 3</option>
                </select>
                <select className="w-full px-5 py-3 rounded-lg border text-lg" defaultValue="">
                  <option value="" disabled>Khóa Học Quan Tâm</option>
                  <option value="ielts">IELTS</option>
                  <option value="toeic">TOEIC</option>
                  <option value="giao-tiep">Giao tiếp</option>
                  <option value="tre-em">Tiếng Anh trẻ em</option>
                </select>
                <div className="col-span-1 md:col-span-2 flex justify-center mt-2">
                  <div className="bg-gray-100 rounded-lg px-6 py-4 w-full max-w-xs flex items-center justify-center">
                    <span className="text-gray-500">[reCAPTCHA]</span>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-center mt-2">
                  <button type="submit" className="w-full max-w-xs bg-[#ff4d4f] text-white font-bold py-3 rounded-lg text-lg shadow hover:bg-primary/90 transition">Đăng ký ngay</button>
                </div>
              </form>
              <div className="text-xs text-gray-500 text-center border-t pt-4">
                Mọi Thông Tin Của Bạn Sẽ Được Bảo Mật Và Không Sử Dụng Thông Tin Cá Nhân Của Khách Hàng Để Gửi Quảng Cáo, Giới Thiệu Dịch Vụ Và Các Thông Tin Có Tính Thương Mại Khác Khi Chưa Được Khách Hàng Chấp Thuận. Đọc Thêm Về <span className="text-[#ff4d4f] italic">Chính Sách Bảo Mật</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll-to-top button */}
      <button
        className={`fixed bottom-8 right-8 z-50 bg-primary text-white rounded-full shadow-lg p-3 transition-all duration-500 hover:bg-primary/90 focus:outline-none ${showScrollTop ? 'opacity-100 pointer-events-auto animate-shake' : 'opacity-0 pointer-events-none'}`}
        style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.15)' }}
        onClick={handleScrollToTop}
        aria-label="Lên đầu trang"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.1" />
          <path d="M12 16V8M12 8L8 12M12 8L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

function TeacherCard({ name, role, avatar, details }: { name: string, role: string, avatar: string, details: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`bg-white rounded-lg shadow p-6 text-center transition-all duration-300 border-2 border-transparent hover:border-primary hover:shadow-2xl hover:-translate-y-2 cursor-pointer`}
      onClick={() => setOpen((v) => !v)}
    >
      <img src={avatar} alt={name} className="mx-auto rounded-full w-24 h-24 mb-4 object-cover border-4 border-primary/30" />
      <h3 className="font-bold mb-2 text-lg">{name}</h3>
      <p className="text-gray-600 mb-2">{role}</p>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
        <div className="text-gray-700 text-sm bg-gray-50 rounded p-3 border mt-2">
          {details}
        </div>
      </div>
      <div className="mt-2 text-primary text-sm font-semibold">{open ? 'Ẩn thông tin ▲' : 'Xem thêm ▼'}</div>
    </div>
  );
}

export default Index;
