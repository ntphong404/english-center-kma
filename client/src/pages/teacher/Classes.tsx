import { useState, useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users, Eye } from "lucide-react";
import { classApi } from '@/api/classApi';
import teacherApi from '@/api/teacherApi';
import studentApi from "@/api/studentApi";
import { ClassResponse, CreateClassRequest, ClassUpdateRequest } from '@/types/entityclass';
import { Teacher, Student } from '@/types/user';
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/ui/table-pagination";
import { getUser } from '@/store/userStore';
import ColoredTable from '@/components/ui/ColoredTable';
import CustomDialog from '@/components/CustomDialog';

const TIME_SLOTS = [
    { label: "7:30 - 9:30", startTime: "07:30:00", endTime: "09:30:00" },
    { label: "9:30 - 11:30", startTime: "09:30:00", endTime: "11:30:00" },
    { label: "13:30 - 15:30", startTime: "13:30:00", endTime: "15:30:00" },
    { label: "15:30 - 17:30", startTime: "15:30:00", endTime: "17:30:00" },
];

const DAYS_OF_WEEK = [
    { value: "MONDAY", label: "Thứ 2" },
    { value: "TUESDAY", label: "Thứ 3" },
    { value: "WEDNESDAY", label: "Thứ 4" },
    { value: "THURSDAY", label: "Thứ 5" },
    { value: "FRIDAY", label: "Thứ 6" },
    { value: "SATURDAY", label: "Thứ 7" },
    { value: "SUNDAY", label: "Chủ nhật" },
];

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'OPEN', label: 'Đang mở' },
    { value: 'UPCOMING', label: 'Sắp khai giảng' },
    { value: 'CLOSED', label: 'Đã đóng' },
];

export default function TeacherClasses() {
    const { toast } = useToast();
    const [classes, setClasses] = useState<ClassResponse[]>([]);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(6);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
    const [isAddStudentsDialogOpen, setIsAddStudentsDialogOpen] = useState(false);
    const [selectedClassForStudents, setSelectedClassForStudents] = useState<ClassResponse | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [studentPage, setStudentPage] = useState(1);
    const [studentTotalPages, setStudentTotalPages] = useState(1);
    const [studentTotalItems, setStudentTotalItems] = useState(0);
    const STUDENT_PAGE_SIZE = 6;
    const [isViewStudentsDialogOpen, setIsViewStudentsDialogOpen] = useState(false);
    const [selectedClassForView, setSelectedClassForView] = useState<ClassResponse | null>(null);
    const [classStudents, setClassStudents] = useState<Student[]>([]);
    const [currentStudentPage, setCurrentStudentPage] = useState(1);
    const STUDENTS_PER_PAGE = 6;
    const [isRemoveStudentDialogOpen, setIsRemoveStudentDialogOpen] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<ClassResponse | null>(null);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const teacherId = getUser()?.userId;

    // Form state for new class
    const [newClass, setNewClass] = useState<Partial<CreateClassRequest>>({
        className: '',
        teacherId: teacherId || '',
        grade: 1,
        year: new Date().getFullYear(),
        unitPrice: 0,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        daysOfWeek: [],
        roomName: '',
    });

    const fetchClasses = async () => {
        if (!teacherId) return;
        try {
            const response = await classApi.getAll(undefined, teacherId, undefined, undefined, statusFilter === 'ALL' ? undefined : statusFilter, currentPage - 1, pageSize);
            const pageResponse = response.data.result;
            if (pageResponse) {
                setClasses(pageResponse.content);
                setTotalPages(pageResponse.page.totalPages);
                setTotalItems(pageResponse.page.totalElements);
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchStudents = async (page: number) => {
        try {
            const response = await studentApi.getAll(undefined, undefined, page - 1, STUDENT_PAGE_SIZE, 'userId,ASC');
            const pageResponse = response.data.result;
            if (pageResponse) {
                setStudents(pageResponse.content);
                setStudentTotalPages(pageResponse.page.totalPages);
                setStudentTotalItems(pageResponse.page.totalElements);
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách học sinh",
                variant: "destructive",
            });
        }
    };

    const fetchClassStudents = async (studentIds: string[]) => {
        try {
            const response = await studentApi.getByIds(studentIds);
            if (response.data.result) {
                setClassStudents(response.data.result);
            }
        } catch (error) {
            console.error("Error fetching class students:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách học sinh",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [currentPage, pageSize, teacherId, statusFilter]);

    useEffect(() => {
        if (isAddStudentsDialogOpen && selectedClassForStudents) {
            fetchStudents(studentPage);
        }
    }, [isAddStudentsDialogOpen, studentPage, selectedClassForStudents]);

    useEffect(() => {
        if (isViewStudentsDialogOpen && selectedClassForView) {
            if (selectedClassForView.studentIds && selectedClassForView.studentIds.length > 0) {
                fetchClassStudents(selectedClassForView.studentIds);
            }
        }
    }, [isViewStudentsDialogOpen, selectedClassForView]);

    const handleDelete = async (id: string) => {
        try {
            await classApi.delete(id);
            toast({
                title: "Thành công",
                description: "Xóa lớp học thành công",
            });
            fetchClasses();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa lớp học",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (classData: ClassResponse) => {
        setSelectedClass(classData);
        setIsEditDialogOpen(true);
    };

    const handleCreate = async () => {
        try {
            if (!newClass.className || !newClass.startDate || !newClass.endDate || !newClass.startTime || !newClass.endTime || !newClass.daysOfWeek.length) {
                toast({
                    title: "Lỗi",
                    description: "Vui lòng điền đầy đủ thông tin",
                    variant: "destructive",
                });
                return;
            }

            await classApi.create(newClass as CreateClassRequest);
            toast({
                title: "Thành công",
                description: "Tạo lớp học mới thành công",
            });
            setIsAddDialogOpen(false);
            setNewClass({
                className: '',
                teacherId: teacherId || '',
                grade: 1,
                year: new Date().getFullYear(),
                unitPrice: 0,
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
                daysOfWeek: [],
                roomName: '',
            });
            fetchClasses();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tạo lớp học mới",
                variant: "destructive",
            });
        }
    };

    const handleTimeSlotChange = (timeSlot: typeof TIME_SLOTS[0]) => {
        setNewClass(prev => ({
            ...prev,
            startTime: timeSlot.startTime,
            endTime: timeSlot.endTime,
        }));
    };

    const handleUpdate = async (id: string, formData: ClassUpdateRequest) => {
        try {
            await classApi.patch(id, formData);
            toast({
                title: "Thành công",
                description: "Cập nhật lớp học thành công",
            });
            setIsEditDialogOpen(false);
            fetchClasses();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật lớp học",
                variant: "destructive",
            });
        }
    };

    const formatSchedule = (classItem: ClassResponse) => {
        const daysMap: { [key: string]: string } = {
            'MONDAY': 'Thứ 2',
            'TUESDAY': 'Thứ 3',
            'WEDNESDAY': 'Thứ 4',
            'THURSDAY': 'Thứ 5',
            'FRIDAY': 'Thứ 6',
            'SATURDAY': 'Thứ 7',
            'SUNDAY': 'Chủ nhật'
        };

        const days = classItem.daysOfWeek.map(day => daysMap[day] || day).join(', ');
        const time = `${classItem.startTime.slice(0, 5)} - ${classItem.endTime.slice(0, 5)}`;
        return `${days} (${time})`;
    };

    const handleDaySelection = (day: string) => {
        setNewClass(prev => {
            const currentDays = prev.daysOfWeek || [];
            const updatedDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            return { ...prev, daysOfWeek: updatedDays };
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('daysDropdown');
            const trigger = document.getElementById('daysTrigger');
            if (dropdown && trigger && !dropdown.contains(event.target as Node) && !trigger.contains(event.target as Node)) {
                setIsDaysDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddStudents = async () => {
        if (!selectedClassForStudents) return;
        try {
            await classApi.addStudents(selectedClassForStudents.classId, selectedStudents);
            setIsAddStudentsDialogOpen(false);
            setSelectedStudents([]);
            fetchClasses();
            toast({
                title: "Thành công",
                description: "Thêm học sinh vào lớp thành công",
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể thêm học sinh vào lớp",
                variant: "destructive",
            });
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClassForView) return;
        try {
            await classApi.removeStudent(selectedClassForView.classId, studentId);
            setClassStudents(classStudents.filter(student => student.userId !== studentId));
            fetchClasses();
            toast({
                title: "Thành công",
                description: "Xóa học sinh khỏi lớp thành công",
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa học sinh khỏi lớp",
                variant: "destructive",
            });
        }
    };

    const getCurrentPageStudents = () => {
        const startIndex = (currentStudentPage - 1) * STUDENTS_PER_PAGE;
        const endIndex = startIndex + STUDENTS_PER_PAGE;
        return classStudents.slice(startIndex, endIndex);
    };

    const totalStudentPages = Math.ceil(classStudents.length / STUDENTS_PER_PAGE);

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lớp học của tôi</h2>
            </div>
            <div className="flex justify-end items-center mb-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ColoredTable
                columns={[
                    { title: 'Tên lớp' },
                    { title: 'Khối' },
                    { title: 'Phòng học' },
                    { title: 'Lịch học' },
                    { title: 'Sĩ số' },
                    { title: 'Trạng thái' },
                    { title: 'Thao tác', headerClassName: 'text-right' },
                ]}
                data={classes.map((classItem) => [
                    classItem.className,
                    classItem.grade,
                    classItem.roomName,
                    formatSchedule(classItem),
                    classItem.studentIds.length,
                    <span className={`px-2 py-1 rounded-full text-xs ${classItem.status === "OPEN" ? "bg-green-100 text-green-800" : classItem.status === "UPCOMING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>{classItem.status === "OPEN" ? "Đang Mở" : classItem.status === "UPCOMING" ? "Sắp Khai Giảng" : "Đã Đóng"}</span>,
                    <div className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedClassForView(classItem); setClassStudents([]); if (classItem.studentIds && classItem.studentIds.length > 0) { fetchClassStudents(classItem.studentIds); } setIsViewStudentsDialogOpen(true); }}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </div>
                ])}
                renderRow={row => row}
                pageSize={pageSize}
                emptyMessage={classes.length === 0 ? 'Không có lớp học' : ''}
            />

            <TablePagination
                currentPage={currentPage - 1}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={(page) => setCurrentPage(page + 1)}
                itemLabel="lớp học"
            />

            <CustomDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} title="Chỉnh sửa lớp học">
                {selectedClass && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-className" className="text-right">
                                Tên lớp
                            </Label>
                            <Input
                                id="edit-className"
                                className="col-span-3"
                                value={selectedClass.className}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, className: e.target.value } : null)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-grade" className="text-right">
                                Khối
                            </Label>
                            <Input
                                id="edit-grade"
                                type="number"
                                className="col-span-3"
                                value={selectedClass.grade}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, grade: parseInt(e.target.value) } : null)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-unitPrice" className="text-right">
                                Giá một buổi
                            </Label>
                            <div className="col-span-3 flex items-center">
                                <Input
                                    id="edit-unitPrice"
                                    type="number"
                                    className="col-span-3"
                                    value={selectedClass.unitPrice}
                                    onChange={(e) => setSelectedClass(prev => prev ? { ...prev, unitPrice: parseInt(e.target.value) } : null)}
                                />
                                <span className="ml-2 text-sm text-muted-foreground">VNĐ</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-roomName" className="text-right">
                                Phòng học
                            </Label>
                            <Input
                                id="edit-roomName"
                                className="col-span-3"
                                value={selectedClass.roomName}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, roomName: e.target.value } : null)}
                                placeholder="VD: TA1-401"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-timeSlot" className="text-right">
                                Thời gian học
                            </Label>
                            <Select
                                value={`${selectedClass.startTime}-${selectedClass.endTime}`}
                                onValueChange={(value) => {
                                    const timeSlot = TIME_SLOTS.find(slot =>
                                        `${slot.startTime}-${slot.endTime}` === value
                                    );
                                    if (timeSlot && selectedClass) {
                                        setSelectedClass({
                                            ...selectedClass,
                                            startTime: timeSlot.startTime,
                                            endTime: timeSlot.endTime
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Chọn thời gian học" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIME_SLOTS.map((slot) => (
                                        <SelectItem
                                            key={`${slot.startTime}-${slot.endTime}`}
                                            value={`${slot.startTime}-${slot.endTime}`}
                                        >
                                            {slot.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-daysOfWeek" className="text-right">
                                Ngày học
                            </Label>
                            <div className="col-span-3">
                                <div className="relative">
                                    <div
                                        id="editDaysTrigger"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}
                                    >
                                        <span>
                                            {selectedClass.daysOfWeek?.length
                                                ? `${selectedClass.daysOfWeek.length} ngày đã chọn`
                                                : "Chọn ngày học"}
                                        </span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className={`h-4 w-4 opacity-50 transition-transform ${isDaysDropdownOpen ? 'rotate-180' : ''}`}
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    </div>
                                    {isDaysDropdownOpen && (
                                        <div
                                            id="editDaysDropdown"
                                            className="absolute z-50 bottom-full mb-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                                        >
                                            <div className="p-1">
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <div
                                                        key={day.value}
                                                        className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                                        onClick={() => {
                                                            if (selectedClass) {
                                                                const currentDays = selectedClass.daysOfWeek || [];
                                                                const updatedDays = currentDays.includes(day.value)
                                                                    ? currentDays.filter(d => d !== day.value)
                                                                    : [...currentDays, day.value];
                                                                setSelectedClass({
                                                                    ...selectedClass,
                                                                    daysOfWeek: updatedDays
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedClass.daysOfWeek?.includes(day.value)}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                            readOnly
                                                        />
                                                        <span>{day.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-startDate" className="text-right">
                                Ngày bắt đầu
                            </Label>
                            <Input
                                id="edit-startDate"
                                type="date"
                                className="col-span-3"
                                value={selectedClass.startDate}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-endDate" className="text-right">
                                Ngày kết thúc
                            </Label>
                            <Input
                                id="edit-endDate"
                                type="date"
                                className="col-span-3"
                                value={selectedClass.endDate}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                            />
                        </div>
                    </div>
                )}
                <div className="flex justify-end">
                    <Button onClick={() => {
                        if (selectedClass) {
                            handleUpdate(selectedClass.classId, selectedClass);
                        }
                    }}>Lưu thay đổi</Button>
                </div>
            </CustomDialog>

            <CustomDialog open={isAddStudentsDialogOpen} onOpenChange={setIsAddStudentsDialogOpen} title={`Thêm học sinh vào lớp ${selectedClassForStudents?.className}`}>
                <div className="space-y-4">
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Tên học sinh</TableHead>
                                    <TableHead>Ngày sinh</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.userId}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedStudents.includes(student.userId)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedStudents([...selectedStudents, student.userId]);
                                                    } else {
                                                        setSelectedStudents(selectedStudents.filter(id => id !== student.userId));
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{student.fullName || student.username}</TableCell>
                                        <TableCell>
                                            {student.dob ? format(new Date(student.dob), 'dd/MM/yyyy', { locale: vi }) : '-'}
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">Đã chọn {selectedStudents.length} học sinh</div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setStudentPage(prev => Math.max(prev - 1, 1))} disabled={studentPage === 1}>Trước</Button>
                            <span className="text-sm">Trang {studentPage} / {studentTotalPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setStudentPage(prev => Math.min(prev + 1, studentTotalPages))} disabled={studentPage === studentTotalPages}>Sau</Button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddStudentsDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddStudents} disabled={selectedStudents.length === 0}>Thêm học sinh</Button>
                    </div>
                </div>
            </CustomDialog>

            {/* View Students Dialog */}
            <CustomDialog open={isViewStudentsDialogOpen} onOpenChange={setIsViewStudentsDialogOpen} title={`Danh sách học sinh lớp ${selectedClassForView?.className}`}>
                <div className="space-y-4">
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên học sinh</TableHead>
                                    <TableHead>Ngày sinh</TableHead>
                                    <TableHead>Email</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {getCurrentPageStudents().map((student) => (
                                    <TableRow key={student.userId}>
                                        <TableCell>{student.fullName || student.username}</TableCell>
                                        <TableCell>
                                            {student.dob ? format(new Date(student.dob), 'dd/MM/yyyy', { locale: vi }) : '-'}
                                        </TableCell>
                                        <TableCell>{student.email}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <TablePagination
                        currentPage={currentStudentPage - 1}
                        totalPages={totalStudentPages}
                        totalItems={classStudents.length}
                        onPageChange={(page) => setCurrentStudentPage(page + 1)}
                        itemLabel="học sinh"
                    />
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => { setIsViewStudentsDialogOpen(false); setCurrentStudentPage(1); }}>Đóng</Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Remove Student Confirmation Dialog */}
            <CustomDialog open={isRemoveStudentDialogOpen} onOpenChange={setIsRemoveStudentDialogOpen} title="Xóa học sinh khỏi lớp">
                <div>Bạn có chắc chắn muốn xóa học sinh {studentToRemove?.fullName || studentToRemove?.username} khỏi lớp {selectedClassForView?.className}?</div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsRemoveStudentDialogOpen(false)}>Hủy</Button>
                    <Button variant="destructive" onClick={() => { if (studentToRemove) { handleRemoveStudent(studentToRemove.userId); setIsRemoveStudentDialogOpen(false); } }}>Xóa</Button>
                </div>
            </CustomDialog>

            {/* Delete Confirmation Dialog */}
            <CustomDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Xóa lớp học">
                <div>Bạn có chắc chắn muốn xóa lớp {classToDelete?.className}? Hành động này không thể hoàn tác.</div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                    <Button variant="destructive" onClick={() => { if (classToDelete) { handleDelete(classToDelete.classId); setIsDeleteDialogOpen(false); } }}>Xóa</Button>
                </div>
            </CustomDialog>
        </div>
    );
} 