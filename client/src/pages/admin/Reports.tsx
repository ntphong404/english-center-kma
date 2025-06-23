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
import { Bar, Line, Pie } from 'react-chartjs-2';
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

    const barRef = useRef(null);
    const lineRef = useRef(null);
    const pieRef = useRef(null);
    const { state: sidebarState } = useSidebar();

    const { ref: containerRef } = useResizeObserver({
        onResize: () => {
            barRef.current?.chart?.resize();
            lineRef.current?.chart?.resize();
            pieRef.current?.chart?.resize();
        },
    });

    useEffect(() => {
        setLoading(true);
        Promise.all([
            studentApi.getAll(undefined, undefined, 0, 1),
            classApi.getAll(undefined, undefined, undefined, undefined, 0, 100),
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

    // Pie chart: fetch student count by grade (1-5)
    useEffect(() => {
        let isMounted = true;
        async function fetchPieData() {
            setPieLoading(true);
            try {
                const gradeLabels: string[] = [];
                const gradeCounts: number[] = [];
                for (let grade = 1; grade <= 5; grade++) {
                    const res = await classApi.getAll(undefined, undefined, undefined, grade, 0, 1);
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
            ['Doanh thu theo tháng', revenueByMonth.map((v, i) => `T${i + 1}: ${v}`).join('; ')],
            ['Doanh thu theo quý', revenueByQuarter.map((v, i) => `Q${i + 1}: ${v}`).join('; ')],
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

    return (
        <div ref={containerRef} className="space-y-10 overflow-x-hidden w-full min-h-screen bg-gray-100">
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
        </div>
    );
}
