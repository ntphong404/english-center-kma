import { useEffect, useState } from 'react';
import { teacherPaymentApi } from '@/api/teacherPaymentApi';
import { TeacherPaymentResponse } from '@/types/teacherpayment';
import { getUser } from '@/store/userStore';
import ColoredTable from '@/components/ui/ColoredTable';
import CustomDialog from '@/components/CustomDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TablePagination } from '@/components/ui/table-pagination';
import { Eye } from 'lucide-react';

interface MonthYear {
    month: number;
    year: number;
}

export default function TeacherPayment() {
    const teacherId = getUser()?.userId;
    const [payments, setPayments] = useState<TeacherPaymentResponse[]>([]);
    const [month, setMonth] = useState<number | undefined>(undefined);
    const [year, setYear] = useState<number | undefined>(undefined);
    const [page, setPage] = useState(0);
    const [pageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyRecords, setHistoryRecords] = useState<TeacherPaymentResponse[]>([]);
    const [historyMonth, setHistoryMonth] = useState<number | null>(null);
    const [historyYear, setHistoryYear] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Helper: lấy tháng/năm hiện tại
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Lấy danh sách các tháng từ hiện tại về tháng cũ nhất
    useEffect(() => {
        let cancelled = false;
        async function fetchPayments() {
            setLoading(true);
            if (month && year) {
                // Nếu chọn tháng/năm: chỉ lấy bản ghi mới nhất tháng đó
                const res = await teacherPaymentApi.getMySalary(month, year, 0, 1, ['createdAt,desc']);
                if (!cancelled) {
                    const items = res.data.result.content;
                    setPayments(items);
                    setTotalItems(items.length);
                    setPage(0);
                }
            } else {
                // Không chọn tháng/năm: lấy tháng cũ nhất
                const resOldest = await teacherPaymentApi.getMySalary(undefined, undefined, 0, 1, ['createdAt,asc']);
                const oldest = resOldest.data.result.content[0];
                if (!oldest) {
                    setPayments([]);
                    setTotalItems(0);
                    setPage(0);
                    setLoading(false);
                    return;
                }
                // Duyệt từ hiện tại về tháng cũ nhất
                const oldestDate = new Date(oldest.year, oldest.month - 1);
                const months: MonthYear[] = [];
                let d = new Date(currentYear, currentMonth - 1);
                while (d >= oldestDate) {
                    months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
                    d.setMonth(d.getMonth() - 1);
                }
                // Gọi API lấy bản ghi mới nhất cho từng tháng
                const promises = months.map(({ month, year }) =>
                    teacherPaymentApi.getMySalary(month, year, 0, 1, ['createdAt,desc'])
                        .then(res => res.data.result.content[0])
                );
                const results = (await Promise.all(promises)).filter(Boolean);
                if (!cancelled) {
                    setPayments(results);
                    setTotalItems(results.length);
                    setPage(0);
                }
            }
            setLoading(false);
        }
        fetchPayments();
        return () => { cancelled = true; };
    }, [month, year, currentMonth, currentYear]);

    // Xem lịch sử lương tháng/năm
    const openHistory = async (m: number, y: number) => {
        setHistoryOpen(true);
        setHistoryMonth(m);
        setHistoryYear(y);
        const res = await teacherPaymentApi.getMySalary(m, y, 0, 100, ['createdAt,desc']);
        setHistoryRecords(res.data.result.content);
    };

    // FE pagination
    const pagedPayments = payments.slice(page * pageSize, (page + 1) * pageSize);

    const totalAmount = pagedPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = pagedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const totalRemain = pagedPayments.reduce((sum, p) => sum + p.remainingAmount, 0);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Bảng lương của tôi</h2>
            <div className="flex gap-4 mb-4">
                <select value={month ?? ''} onChange={e => setMonth(e.target.value ? Number(e.target.value) : undefined)} className="border rounded px-2 py-1">
                    <option value="">Tất cả tháng</option>
                    {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                    ))}
                </select>
                <select value={year ?? ''} onChange={e => setYear(e.target.value ? Number(e.target.value) : undefined)} className="border rounded px-2 py-1">
                    <option value="">Tất cả năm</option>
                    {Array.from({ length: 5 }, (_, i) => currentYear - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <span className="mr-4">Tổng lương: <b>{totalAmount.toLocaleString()}đ</b></span>
                <span className="mr-4">Đã thanh toán: <b>{totalPaid.toLocaleString()}đ</b></span>
                <span>Còn lại: <b>{totalRemain.toLocaleString()}đ</b></span>
            </div>
            <ColoredTable
                columns={[
                    { title: 'Tháng/Năm' },
                    { title: 'Tổng lương' },
                    { title: 'Đã thanh toán' },
                    { title: 'Còn lại' },
                    { title: 'Trạng thái' },
                    { title: 'Ghi chú' },
                    { title: 'Ngày tạo' },
                    { title: 'Lịch sử' },
                ]}
                data={pagedPayments.map(p => [
                    `${p.month}/${p.year}`,
                    `${p.amount.toLocaleString()}đ`,
                    `${p.paidAmount.toLocaleString()}đ`,
                    `${p.remainingAmount.toLocaleString()}đ`,
                    <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'PAID' ? 'bg-green-100 text-green-800' : p.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{p.status === 'PAID' ? 'Đã thanh toán' : p.status === 'PARTIALLY_PAID' ? 'Chưa thanh toán đủ' : 'Chưa thanh toán'}</span>,
                    p.note,
                    new Date(p.createdAt).toLocaleDateString(),
                    <Button variant="ghost" size="icon" onClick={() => openHistory(p.month, p.year)}><Eye className="w-4 h-4" /></Button>
                ])}
                renderRow={row => row}
                pageSize={pageSize}
                emptyMessage={pagedPayments.length === 0 ? 'Không có dữ liệu' : ''}
            />
            <TablePagination
                currentPage={page}
                totalPages={Math.ceil(totalItems / pageSize)}
                totalItems={totalItems}
                onPageChange={setPage}
                itemLabel="bản ghi"
            />
            {historyOpen && (
                <CustomDialog open={historyOpen} onOpenChange={setHistoryOpen} title={`Lịch sử lương tháng ${historyMonth}/${historyYear}`}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tổng lương</TableHead>
                                <TableHead>Đã thanh toán</TableHead>
                                <TableHead>Còn lại</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ghi chú</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Không có dữ liệu</TableCell>
                                </TableRow>
                            )}
                            {historyRecords.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell>{r.amount.toLocaleString()}đ</TableCell>
                                    <TableCell>{r.paidAmount.toLocaleString()}đ</TableCell>
                                    <TableCell>{r.remainingAmount.toLocaleString()}đ</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${r.status === 'PAID' ? 'bg-green-100 text-green-800' : r.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{r.status === 'PAID' ? 'Đã thanh toán' : r.status === 'PARTIALLY_PAID' ? 'Chưa thanh toán đủ' : 'Chưa thanh toán'}</span>
                                    </TableCell>
                                    <TableCell>{r.note}</TableCell>
                                    <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CustomDialog>
            )}
        </div>
    );
} 