import React, { useEffect, useState, useRef } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import studentApi from '@/api/studentApi';
import { classApi } from '@/api/classApi';
import paymentApi from '@/api/paymentApi';
import { teacherPaymentApi } from '@/api/teacherPaymentApi';
import teacherApi from '@/api/teacherApi';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import Papa from 'papaparse';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import useResizeObserver from 'use-resize-observer';
import { useSidebar } from '@/components/ui/sidebar';
import { ClassResponse } from '@/types/entityclass';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminReports() {
    const [studentCount, setStudentCount] = useState(0);
    const [classCount, setClassCount] = useState(0);
    const [revenueByMonth, setRevenueByMonth] = useState<number[]>(Array(12).fill(0));
    const [revenueByQuarter, setRevenueByQuarter] = useState<number[]>(Array(4).fill(0));
    const [retentionRate, setRetentionRate] = useState(0);
    const [levelDist, setLevelDist] = useState<{ label: string, value: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [pieLoading, setPieLoading] = useState(true);

    // New state variables for student statistics
    const [studentsNoClass, setStudentsNoClass] = useState(0);
    const [studentsNoClassByMonth, setStudentsNoClassByMonth] = useState<number[]>(Array(12).fill(0));
    const [studentsCreatedByMonth, setStudentsCreatedByMonth] = useState<number[]>(Array(12).fill(0));
    const [currentYear] = useState(new Date().getFullYear());

    // New state variables for teacher salary reports
    const [teacherSalaryByMonth, setTeacherSalaryByMonth] = useState<number[]>(Array(12).fill(0));
    const [teacherSalaryByQuarter, setTeacherSalaryByQuarter] = useState<number[]>(Array(4).fill(0));
    const [totalTeacherSalary, setTotalTeacherSalary] = useState(0);
    const [teacherCount, setTeacherCount] = useState(0);
    const [salaryLoading, setSalaryLoading] = useState(true);

    const barRef = useRef(null);
    const lineRef = useRef(null);
    const pieRef = useRef(null);
    const salaryBarRef = useRef(null);
    const salaryLineRef = useRef(null);
    const { state: sidebarState } = useSidebar();

    const { ref: containerRef } = useResizeObserver({
        onResize: () => {
            barRef.current?.chart?.resize();
            lineRef.current?.chart?.resize();
            pieRef.current?.chart?.resize();
            salaryBarRef.current?.chart?.resize();
            salaryLineRef.current?.chart?.resize();
        },
    });

    useEffect(() => {
        setLoading(true);
        Promise.all([
            studentApi.getAll(undefined, undefined, 0, 1),
            classApi.getAll(undefined, undefined, undefined, undefined, undefined, 0, 100),
            paymentApi.getAll(undefined, undefined, 0, 1000)
        ]).then(([stuRes, classRes, payRes]) => {
            let students = 0;
            if (Array.isArray(stuRes.data?.result)) {
                students = stuRes.data.result.length;
            } else if (stuRes.data?.result?.page?.totalElements !== undefined) {
                students = stuRes.data.result.page.totalElements;
            }
            setStudentCount(students);

            const classes = classRes.data?.result?.content || classRes.data?.result || [];
            const classesArr = Array.isArray(classes) ? classes : classes.content ?? [];
            setClassCount(classesArr.length);

            const gradeMap: Record<string, number> = {};
            classesArr.forEach((cls: any) => {
                const grade = cls.grade ? `Khối ${cls.grade}` : 'Khác';
                gradeMap[grade] = (gradeMap[grade] || 0) + (cls.studentIds?.length || 0);
            });
            setLevelDist(Object.entries(gradeMap).map(([label, value]) => ({ label, value })));

            const payments = payRes.data?.result?.content || payRes.data?.result || [];
            const paymentsArr = Array.isArray(payments) ? payments : payments.content ?? [];
            const monthArr = Array(12).fill(0);
            const quarterArr = Array(4).fill(0);
            paymentsArr.forEach((p: any) => {
                if (p.tuitionFee?.yearMonth && p.paidAmount) {
                    const [_, month] = p.tuitionFee.yearMonth.split('-').map(Number);
                    if (month >= 1 && month <= 12) {
                        monthArr[month - 1] += p.paidAmount;
                        quarterArr[Math.floor((month - 1) / 3)] += p.paidAmount;
                    }
                }
            });
            setRevenueByMonth(monthArr);
            setRevenueByQuarter(quarterArr);

            const uniqueStudentIds = new Set<string>();
            classesArr.forEach((cls: any) => {
                (cls.studentIds || []).forEach((id: string) => uniqueStudentIds.add(id));
            });
            setRetentionRate(students ? Math.round((uniqueStudentIds.size / students) * 100) : 0);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // Fetch student statistics
    useEffect(() => {
        const fetchStudentStats = async () => {
            try {
                // Get students with no class
                const noClassRes = await studentApi.countNoClass();
                setStudentsNoClass(noClassRes.data.result || 0);

                // Get students with no class by month for current year
                const noClassByMonthPromises = Array.from({ length: 12 }, (_, i) =>
                    studentApi.countNoClassByMonth(i + 1, currentYear)
                );
                const noClassByMonthResults = await Promise.all(noClassByMonthPromises);
                const noClassByMonthData = noClassByMonthResults.map(res => res.data.result || 0);
                setStudentsNoClassByMonth(noClassByMonthData);

                // Get students created by month for current year
                const createdByMonthPromises = Array.from({ length: 12 }, (_, i) =>
                    studentApi.countByCreatedAt(i + 1, currentYear)
                );
                const createdByMonthResults = await Promise.all(createdByMonthPromises);
                const createdByMonthData = createdByMonthResults.map(res => res.data.result || 0);
                setStudentsCreatedByMonth(createdByMonthData);
            } catch (error) {
                console.error('Error fetching student statistics:', error);
            }
        };

        fetchStudentStats();
    }, [currentYear]);

    // Fetch teacher salary data
    useEffect(() => {
        const fetchTeacherSalaryData = async () => {
            setSalaryLoading(true);
            try {
                // Get all teachers
                const teachersRes = await teacherApi.getAll(undefined, undefined, 0, 100);
                const teachers = teachersRes.data?.result?.content || teachersRes.data?.result || [];
                const teachersArr = Array.isArray(teachers) ? teachers : teachers.content ?? [];
                setTeacherCount(teachersArr.length);

                // Get teacher payments for current year
                const teacherPaymentsRes = await teacherPaymentApi.getAll(undefined, undefined, currentYear, 0, 1000);
                const teacherPayments = teacherPaymentsRes.data?.result?.content || teacherPaymentsRes.data?.result || [];
                const teacherPaymentsArr = Array.isArray(teacherPayments) ? teacherPayments : teacherPayments.content ?? [];

                const salaryByMonth = Array(12).fill(0);
                const salaryByQuarter = Array(4).fill(0);
                let totalSalary = 0;

                teacherPaymentsArr.forEach((payment: any) => {
                    if (payment.year === currentYear && payment.paidAmount) {
                        const month = payment.month - 1; // 0-based index
                        if (month >= 0 && month < 12) {
                            salaryByMonth[month] += payment.paidAmount;
                            salaryByQuarter[Math.floor(month / 3)] += payment.paidAmount;
                            totalSalary += payment.paidAmount;
                        }
                    }
                });

                setTeacherSalaryByMonth(salaryByMonth);
                setTeacherSalaryByQuarter(salaryByQuarter);
                setTotalTeacherSalary(totalSalary);
            } catch (error) {
                console.error('Error fetching teacher salary data:', error);
            } finally {
                setSalaryLoading(false);
            }
        };

        fetchTeacherSalaryData();
    }, [currentYear]);

    // Pie chart: fetch student count by grade (1-5)
    useEffect(() => {
        let isMounted = true;
        async function fetchPieData() {
            setPieLoading(true);
            try {
                const gradeLabels: string[] = [];
                const gradeCounts: number[] = [];
                for (let grade = 1; grade <= 5; grade++) {
                    const res = await classApi.getAll(undefined, undefined, undefined, grade, "OPEN", 0, 1);
                    let total = 0;
                    const page = res.data.result && typeof res.data.result === 'object' && 'page' in res.data.result ? (res.data.result as any).page : undefined;
                    if (page && typeof page === 'object' && 'totalElements' in page) {
                        total = page.totalElements;
                    }
                    gradeLabels.push(`Khối ${grade}`);
                    gradeCounts.push(total);
                }
                if (isMounted) {
                    setLevelDist(gradeLabels.map((label, i) => ({ label, value: gradeCounts[i] })));
                }
            } catch {
                if (isMounted) setLevelDist([]);
            }
            if (isMounted) setPieLoading(false);
        }
        fetchPieData();
        return () => { isMounted = false; };
    }, []);

    const lastMonthRevenue = [...revenueByMonth].reverse().find(v => v > 0)?.toLocaleString('vi-VN') + 'đ' || '0đ';

    const handleExportCSV = () => {
        const rows = [
            ['Thống kê', 'Giá trị'],
            ['Tổng số học viên', studentCount],
            ['Tổng số lớp học', classCount],
            ['Doanh thu tháng gần nhất', lastMonthRevenue],
            ['Tỷ lệ duy trì', retentionRate + '%'],
            ['Học viên chưa có lớp', studentsNoClass],
            ['Tổng số giáo viên', teacherCount],
            ['Tổng tiền đã trả cho giáo viên', totalTeacherSalary.toLocaleString('vi-VN') + 'đ'],
            ['Doanh thu theo tháng', revenueByMonth.map((v, i) => `T${i + 1}: ${v}`).join('; ')],
            ['Doanh thu theo quý', revenueByQuarter.map((v, i) => `Q${i + 1}: ${v}`).join('; ')],
            ['Tiền đã trả cho giáo viên theo tháng', teacherSalaryByMonth.map((v, i) => `T${i + 1}: ${v}`).join('; ')],
            ['Tiền đã trả cho giáo viên theo quý', teacherSalaryByQuarter.map((v, i) => `Q${i + 1}: ${v}`).join('; ')],
            ['Học viên chưa có lớp theo tháng', studentsNoClassByMonth.map((v, i) => `T${i + 1}: ${v}`).join('; ')],
            ['Học viên mới theo tháng', studentsCreatedByMonth.map((v, i) => `T${i + 1}: ${v}`).join('; ')],
            ['Phân bố học viên theo trình độ', levelDist.map(l => `${l.label}: ${l.value}`).join('; ')],
        ];
        const csv = '\uFEFF' + Papa.unparse(rows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'bao_cao_thong_ke.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const barData = {
        labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
        datasets: [{
            label: 'Doanh thu theo tháng',
            data: revenueByMonth,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }],
    };

    const lineData = {
        labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
        datasets: [{
            label: 'Doanh thu theo quý',
            data: revenueByQuarter,
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.4,
        }],
    };

    const pieData = {
        labels: levelDist.map(l => l.label),
        datasets: [{
            data: levelDist.map(l => l.value),
            backgroundColor: ['#3b82f6', '#22c55e', '#a21caf', '#f59e42', '#f43f5e', '#fbbf24', '#6366f1', '#10b981', '#f472b6', '#f87171', '#34d399', '#818cf8'],
        }],
    };

    // New chart data for student statistics
    const studentStatsData = {
        labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
        datasets: [
            {
                label: 'Học viên chưa có lớp',
                data: studentsNoClassByMonth,
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            },
            {
                label: 'Học viên mới',
                data: studentsCreatedByMonth,
                backgroundColor: 'rgba(34, 197, 94, 0.5)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
            }
        ],
    };

    // New chart data for teacher salary
    const teacherSalaryBarData = {
        labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
        datasets: [{
            label: 'Tiền đã trả cho giáo viên theo tháng',
            data: teacherSalaryByMonth,
            backgroundColor: 'rgba(168, 85, 247, 0.5)',
            borderColor: 'rgba(168, 85, 247, 1)',
            borderWidth: 1,
        }],
    };

    const teacherSalaryLineData = {
        labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
        datasets: [{
            label: 'Tiền đã trả cho giáo viên theo quý',
            data: teacherSalaryByQuarter,
            borderColor: 'rgba(245, 158, 11, 1)',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            tension: 0.4,
        }],
    };

    return (
        <div ref={containerRef} className="space-y-10 overflow-x-hidden w-full min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Báo cáo thống kê</h2>
                <Button onClick={handleExportCSV}>
                    <Download className="mr-2 h-4 w-4" /> Xuất báo cáo
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[{
                    title: 'Tổng số học viên',
                    value: studentCount,
                    description: 'Số lượng học viên hiện tại'
                }, {
                    title: 'Tổng số lớp học',
                    value: classCount,
                    description: 'Số lượng lớp học hiện tại'
                }, {
                    title: 'Doanh thu tháng này',
                    value: lastMonthRevenue,
                    description: 'Doanh thu tháng gần nhất'
                }, {
                    title: 'Tỷ lệ duy trì',
                    value: retentionRate + '%',
                    description: 'Tỷ lệ học viên tiếp tục học'
                }].map((stat, idx) => (
                    <Card key={idx} className="p-2">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">{stat.title}</CardTitle>
                            <CardDescription className="text-xs">{stat.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{loading ? '...' : stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* New statistics cards */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[{
                    title: 'Học viên chưa có lớp',
                    value: studentsNoClass,
                    description: 'Học viên chưa được phân lớp'
                }, {
                    title: 'Tổng số giáo viên',
                    value: teacherCount,
                    description: 'Số lượng giáo viên hiện tại'
                }, {
                    title: 'Tổng tiền đã trả cho giáo viên',
                    value: totalTeacherSalary.toLocaleString('vi-VN') + 'đ',
                    description: 'Tổng tiền đã trả cho giáo viên năm ' + currentYear
                }, {
                    title: 'Học viên mới tháng này',
                    value: studentsCreatedByMonth[new Date().getMonth()] || 0,
                    description: 'Học viên mới đăng ký tháng hiện tại'
                }].map((stat, idx) => (
                    <Card key={idx} className="p-2">
                        <CardHeader className="pb-1">
                            <CardTitle className="text-base">{stat.title}</CardTitle>
                            <CardDescription className="text-xs">{stat.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{loading ? '...' : stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mb-10">
                <CardHeader>
                    <CardTitle>Doanh thu theo tháng</CardTitle>
                    <CardDescription>Biểu đồ cột doanh thu 12 tháng</CardDescription>
                </CardHeader>
                <CardContent className="h-72 w-full min-w-0 max-w-5xl mx-auto">
                    <Bar ref={barRef} data={barData} options={{ maintainAspectRatio: false, responsive: true }} />
                </CardContent>
            </Card>

            <div className="grid gap-10 md:grid-cols-2 mb-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Doanh thu theo quý</CardTitle>
                        <CardDescription>Biểu đồ đường doanh thu 4 quý</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72 w-full min-w-0 max-w-3xl mx-auto">
                        <Line ref={lineRef} data={lineData} options={{ maintainAspectRatio: false, responsive: true }} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bố học viên theo trình độ</CardTitle>
                        <CardDescription>Biểu đồ tròn phân bố học viên</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72 w-full min-w-0 max-w-3xl mx-auto">
                        {pieLoading ? (
                            <div className="flex items-center justify-center h-full">Đang tải...</div>
                        ) : (
                            <Pie ref={pieRef} data={pieData} options={{ maintainAspectRatio: false, responsive: true }} />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New student statistics chart */}
            <Card className="mb-10">
                <CardHeader>
                    <CardTitle>Thống kê học viên theo tháng</CardTitle>
                    <CardDescription>Học viên chưa có lớp và học viên mới đăng ký</CardDescription>
                </CardHeader>
                <CardContent className="h-72 w-full min-w-0 max-w-5xl mx-auto">
                    <Bar data={studentStatsData} options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }} />
                </CardContent>
            </Card>

            {/* Teacher salary charts */}
            <Card className="mb-10">
                <CardHeader>
                    <CardTitle>Tiền đã trả cho giáo viên theo tháng</CardTitle>
                    <CardDescription>Biểu đồ cột tiền đã trả cho giáo viên 12 tháng năm {currentYear}</CardDescription>
                </CardHeader>
                <CardContent className="h-72 w-full min-w-0 max-w-5xl mx-auto">
                    {salaryLoading ? (
                        <div className="flex items-center justify-center h-full">Đang tải...</div>
                    ) : (
                        <Bar ref={salaryBarRef} data={teacherSalaryBarData} options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function (value) {
                                            return value.toLocaleString('vi-VN') + 'đ';
                                        }
                                    }
                                }
                            }
                        }} />
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-10 md:grid-cols-2 mb-10">
                <Card>
                    <CardHeader>
                        <CardTitle>Tiền đã trả cho giáo viên theo quý</CardTitle>
                        <CardDescription>Biểu đồ đường tiền đã trả cho giáo viên 4 quý năm {currentYear}</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72 w-full min-w-0 max-w-3xl mx-auto">
                        {salaryLoading ? (
                            <div className="flex items-center justify-center h-full">Đang tải...</div>
                        ) : (
                            <Line ref={salaryLineRef} data={teacherSalaryLineData} options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: function (value) {
                                                return value.toLocaleString('vi-VN') + 'đ';
                                            }
                                        }
                                    }
                                }
                            }} />
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>So sánh doanh thu và tiền đã trả cho giáo viên</CardTitle>
                        <CardDescription>Biểu đồ tròn so sánh tỷ lệ</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72 w-full min-w-0 max-w-3xl mx-auto">
                        {loading || salaryLoading ? (
                            <div className="flex items-center justify-center h-full">Đang tải...</div>
                        ) : (
                            <Doughnut data={{
                                labels: ['Doanh thu', 'Tiền đã trả cho giáo viên'],
                                datasets: [{
                                    data: [
                                        revenueByMonth.reduce((a, b) => a + b, 0),
                                        totalTeacherSalary
                                    ],
                                    backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(168, 85, 247, 0.8)'],
                                    borderColor: ['rgba(59, 130, 246, 1)', 'rgba(168, 85, 247, 1)'],
                                    borderWidth: 2,
                                }],
                            }} options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                const value = context.parsed;
                                                return context.label + ': ' + value.toLocaleString('vi-VN') + 'đ';
                                            }
                                        }
                                    }
                                }
                            }} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
