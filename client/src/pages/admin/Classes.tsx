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
import { Plus, Pencil, Trash2, Users, Eye, ArrowDownNarrowWide, ArrowUpWideNarrow } from "lucide-react";
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
import debounce from "lodash.debounce";
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

export default function AdminClasses() {
    const { toast } = useToast();
    const [classes, setClasses] = useState<ClassResponse[]>([]);
    const [teachers, setTeachers] = useState<Map<string, Teacher>>(new Map());
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
    const [searchName, setSearchName] = useState("");
    const [sortField, setSortField] = useState("className");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Form state for new class
    const [newClass, setNewClass] = useState<Partial<CreateClassRequest> & { status?: string }>({
        className: '',
        teacherId: '',
        grade: 1,
        year: new Date().getFullYear(),
        unitPrice: 0,
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        daysOfWeek: [],
        roomName: '',
        status: 'OPEN',
    });

    const fetchTeachers = async () => {
        try {
            const response = await teacherApi.getAll(undefined, undefined, 0, 100); // Fetch all teachers
            const teacherMap = new Map<string, Teacher>();
            response.data.result.content.forEach(teacher => {
                teacherMap.set(teacher.userId, teacher);
            });
            setTeachers(teacherMap);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách giáo viên",
                variant: "destructive",
            });
        }
    };

    const fetchClasses = async () => {
        try {
            const sortParam = `${sortField},${sortOrder}`;
            const response = await classApi.getAll(
                searchName || undefined,
                undefined,
                undefined,
                undefined,
                statusFilter === "ALL" ? undefined : statusFilter,
                currentPage - 1,
                pageSize,
                sortParam
            );
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
        fetchTeachers();
        fetchClasses();
    }, [currentPage, pageSize, searchName, sortField, sortOrder, statusFilter]);

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

    const getTeacherName = (teacherId: string) => {
        const teacher = teachers.get(teacherId);
        return teacher ? teacher.fullName || teacherId : teacherId;
    };

    const handleDelete = async (id: string) => {
        try {
            await classApi.delete(id);
            toast({
                title: "Thành công",
                description: "Đóng lớp học thành công",
            });
            fetchClasses();
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể đóng lớp học",
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
            if (!newClass.className || !newClass.teacherId || !newClass.startDate || !newClass.endDate || !newClass.startTime || !newClass.endTime || !newClass.daysOfWeek.length) {
                toast({
                    title: "Lỗi",
                    description: "Vui lòng điền đầy đủ thông tin",
                    variant: "destructive",
                });
                return;
            }

            await classApi.create(newClass as CreateClassRequest & { status: string });
            toast({
                title: "Thành công",
                description: "Tạo lớp học mới thành công",
            });
            setIsAddDialogOpen(false);
            setNewClass({
                className: '',
                teacherId: '',
                grade: 1,
                year: new Date().getFullYear(),
                unitPrice: 0,
                startDate: '',
                endDate: '',
                startTime: '',
                endTime: '',
                daysOfWeek: [],
                roomName: '',
                status: 'OPEN',
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
            // Loại bỏ studentIds nếu có trong formData
            const { studentIds, ...rest } = formData as any;
            await classApi.patch(id, rest as ClassUpdateRequest & { status: string });
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

    // Debounce search
    const handleSearch = debounce((value: string) => {
        setSearchName(value);
        setCurrentPage(1);
    }, 400);

    // Hàm xử lý đổi sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý lớp học</h2>
                <div className="flex justify-end items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={val => { setStatusFilter(val); setCurrentPage(1); }}
                    >
                        <SelectTrigger className="w-40 shadow-md">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                            <SelectItem value="OPEN">Đang mở</SelectItem>
                            <SelectItem value="UPCOMING">Sắp khai giảng</SelectItem>
                            <SelectItem value="CLOSED">Đã đóng</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Tìm theo tên lớp..."
                        defaultValue={searchName}
                        onChange={e => handleSearch(e.target.value)}
                        className="w-64 shadow-md"
                    />
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-md rounded-md">
                                <Plus className="mr-2 h-4 w-4" /> Thêm lớp học
                            </Button>
                        </DialogTrigger>
                        <CustomDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} title="Thêm lớp học mới">
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="className" className="text-right">
                                        Tên lớp
                                    </Label>
                                    <Input
                                        id="className"
                                        className="col-span-3 shadow-md"
                                        value={newClass.className}
                                        onChange={(e) => setNewClass(prev => ({ ...prev, className: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="teacherId" className="text-right">
                                        Giáo viên
                                    </Label>
                                    <Select
                                        value={newClass.teacherId}
                                        onValueChange={(value) => setNewClass(prev => ({ ...prev, teacherId: value }))}
                                    >
                                        <SelectTrigger className="col-span-3 shadow-md">
                                            <SelectValue placeholder="Chọn giáo viên" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(teachers.values()).map((teacher) => (
                                                <SelectItem key={teacher.userId} value={teacher.userId}>
                                                    {teacher.fullName || teacher.username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="grade" className="text-right">
                                        Khối
                                    </Label>
                                    <Input
                                        id="grade"
                                        type="number"
                                        className="col-span-3 shadow-md"
                                        value={newClass.grade}
                                        onChange={(e) => setNewClass(prev => ({ ...prev, grade: parseInt(e.target.value) }))}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="unitPrice" className="text-right">
                                        Giá một buổi
                                    </Label>
                                    <div className="col-span-3 flex items-center">
                                        <Input
                                            id="unitPrice"
                                            type="number"
                                            className="col-span-3 shadow-md"
                                            value={newClass.unitPrice}
                                            onChange={(e) => setNewClass(prev => ({ ...prev, unitPrice: parseInt(e.target.value) }))}
                                        />
                                        <span className="ml-2 text-sm text-muted-foreground">VNĐ</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="roomName" className="text-right">
                                        Phòng học
                                    </Label>
                                    <Input
                                        id="roomName"
                                        className="col-span-3 shadow-md"
                                        value={newClass.roomName}
                                        onChange={(e) => setNewClass(prev => ({ ...prev, roomName: e.target.value }))}
                                        placeholder="VD: TA1-401"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="timeSlot" className="text-right">
                                        Thời gian học
                                    </Label>
                                    <Select
                                        value={`${newClass.startTime}-${newClass.endTime}`}
                                        onValueChange={(value) => {
                                            const timeSlot = TIME_SLOTS.find(slot =>
                                                `${slot.startTime}-${slot.endTime}` === value
                                            );
                                            if (timeSlot) {
                                                handleTimeSlotChange(timeSlot);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="col-span-3 shadow-md">
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
                                    <Label htmlFor="startDate" className="text-right">
                                        Ngày bắt đầu
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        className="col-span-3 shadow-md"
                                        value={newClass.startDate}
                                        onChange={(e) => setNewClass(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="endDate" className="text-right">
                                        Ngày kết thúc
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        className="col-span-3 shadow-md"
                                        value={newClass.endDate}
                                        onChange={(e) => setNewClass(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="daysOfWeek" className="text-right">
                                        Ngày học
                                    </Label>
                                    <div className="col-span-3">
                                        <div className="relative">
                                            <div
                                                id="daysTrigger"
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                onClick={() => setIsDaysDropdownOpen(!isDaysDropdownOpen)}
                                            >
                                                <span>
                                                    {newClass.daysOfWeek?.length
                                                        ? `${newClass.daysOfWeek.length} ngày đã chọn`
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
                                                    id="daysDropdown"
                                                    className="absolute z-50 bottom-full mb-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
                                                >
                                                    <div className="p-1">
                                                        {DAYS_OF_WEEK.map((day) => (
                                                            <div
                                                                key={day.value}
                                                                className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                                                onClick={() => handleDaySelection(day.value)}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={newClass.daysOfWeek?.includes(day.value)}
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
                                    <Label htmlFor="status" className="text-right">Trạng thái</Label>
                                    <Select
                                        value={newClass.status || "OPEN"}
                                        onValueChange={val => setNewClass(prev => ({ ...prev, status: val }))}
                                    >
                                        <SelectTrigger className="col-span-3 shadow-md">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Đang mở</SelectItem>
                                            <SelectItem value="UPCOMING">Sắp khai giảng</SelectItem>
                                            <SelectItem value="CLOSED">Đã đóng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button className="shadow-md" onClick={handleCreate}>Lưu</Button>
                            </div>
                        </CustomDialog>
                    </Dialog>
                </div>
            </div>

            <div className="border rounded-md shadow-lg overflow-hidden m-3">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gradient-to-r from-[#3b70c6] to-[#872ace] text-white font-bold">
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Tên lớp</span>
                                    <button type="button" onClick={() => handleSort('className')} className="ml-1">
                                        {sortField === 'className' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Giáo viên</span>
                                    <button type="button" onClick={() => handleSort('teacher.fullName')} className="ml-1">
                                        {sortField === 'teacher.fullName' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Sĩ số</span>
                                    <button type="button" onClick={() => handleSort('studentCount')} className="ml-1">
                                        {sortField === 'studentCount' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Khối</span>
                                    <button type="button" onClick={() => handleSort('grade')} className="ml-1">
                                        {sortField === 'grade' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Phòng học</span>
                                    <button type="button" onClick={() => handleSort('roomName')} className="ml-1">
                                        {sortField === 'roomName' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Lịch học</span>
                                    <button type="button" onClick={() => handleSort('schedule')} className="ml-1">
                                        {sortField === 'schedule' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1 text-white">
                                    <span>Trạng thái</span>
                                    <button type="button" onClick={() => handleSort('status')} className="ml-1">
                                        {sortField === 'status' ? (
                                            sortOrder === 'asc' ? <ArrowUpWideNarrow className="w-4 h-4 text-white" /> : <ArrowDownNarrowWide className="w-4 h-4 text-white" />
                                        ) : (
                                            <ArrowDownNarrowWide className="w-4 h-4 text-white/70" />
                                        )}
                                    </button>
                                </div>
                            </TableHead>
                            <TableHead className="text-white font-bold py-4 text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map((classItem, idx) => (
                            <TableRow key={classItem.classId} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-cyan-50 transition`}>
                                <TableCell>{classItem.className}</TableCell>
                                <TableCell>{getTeacherName(classItem.teacherId)}</TableCell>
                                <TableCell>{classItem.studentIds.length}</TableCell>
                                <TableCell>{classItem.grade}</TableCell>
                                <TableCell>{classItem.roomName}</TableCell>
                                <TableCell>{formatSchedule(classItem)}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs
                                            ${classItem.status === "OPEN"
                                                ? "bg-green-100 text-green-800 shadow-md"
                                                : classItem.status === "UPCOMING"
                                                    ? "bg-yellow-100 text-yellow-800 shadow-md"
                                                    : "bg-red-100 text-red-800 shadow-md"}
                                        `}
                                    >
                                        {classItem.status === "OPEN"
                                            ? "Đang Mở"
                                            : classItem.status === "UPCOMING"
                                                ? "Sắp Khai Giảng"
                                                : "Đã Đóng"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedClassForView(classItem);
                                                setClassStudents([]);
                                                if (classItem.studentIds && classItem.studentIds.length > 0) {
                                                    fetchClassStudents(classItem.studentIds);
                                                }
                                                setIsViewStudentsDialogOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedClassForStudents(classItem);
                                                setSelectedStudents([]);
                                                setStudentPage(1);
                                                fetchStudents(1);
                                                setIsAddStudentsDialogOpen(true);
                                            }}
                                        >
                                            <Users className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedClass(classItem);
                                                setIsEditDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setClassToDelete(classItem);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {Array.from({ length: pageSize - classes.length }).map((_, index) => (
                            <TableRow key={`empty-${index}`} className="h-[53px]">
                                <TableCell colSpan={8}></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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
                                className="col-span-3 shadow-md"
                                value={selectedClass.className}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, className: e.target.value } : null)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-teacherId" className="text-right">
                                Giáo viên
                            </Label>
                            <Select
                                value={selectedClass.teacherId}
                                onValueChange={(value) => setSelectedClass(prev => prev ? { ...prev, teacherId: value } : null)}
                            >
                                <SelectTrigger className="col-span-3 shadow-md">
                                    <SelectValue placeholder="Chọn giáo viên" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from(teachers.values()).map((teacher) => (
                                        <SelectItem key={teacher.userId} value={teacher.userId}>
                                            {teacher.fullName || teacher.username}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-grade" className="text-right">
                                Khối
                            </Label>
                            <Input
                                id="edit-grade"
                                type="number"
                                className="col-span-3 shadow-md"
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
                                    className="col-span-3 shadow-md"
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
                                className="col-span-3 shadow-md"
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
                                <SelectTrigger className="col-span-3 shadow-md">
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
                                className="col-span-3 shadow-md"
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
                                className="col-span-3 shadow-md"
                                value={selectedClass.endDate}
                                onChange={(e) => setSelectedClass(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-status" className="text-right">Trạng thái</Label>
                            <Select
                                value={selectedClass.status || "OPEN"}
                                onValueChange={val => setSelectedClass(prev => prev ? { ...prev, status: val } : null)}
                            >
                                <SelectTrigger className="col-span-3 shadow-md">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Đang mở</SelectItem>
                                    <SelectItem value="UPCOMING">Sắp khai giảng</SelectItem>
                                    <SelectItem value="CLOSED">Đã đóng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
                <div className="flex justify-end">
                    <Button className="shadow-md" onClick={() => {
                        if (selectedClass) {
                            handleUpdate(selectedClass.classId, selectedClass as ClassUpdateRequest & { status: string });
                        }
                    }}>Lưu thay đổi</Button>
                </div>
            </CustomDialog>

            <CustomDialog open={isAddStudentsDialogOpen} onOpenChange={setIsAddStudentsDialogOpen} title={`Thêm học sinh vào lớp ${selectedClassForStudents?.className || ''}`} maxWidth="max-w-4xl">
                <div className="space-y-4">
                    <div className="border rounded-md shadow-md">
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
                        <div className="text-sm text-muted-foreground">
                            Đã chọn {selectedStudents.length} học sinh
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStudentPage(prev => Math.max(prev - 1, 1))}
                                disabled={studentPage === 1}
                            >
                                Trước
                            </Button>
                            <span className="text-sm">
                                Trang {studentPage} / {studentTotalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setStudentPage(prev => Math.min(prev + 1, studentTotalPages))}
                                disabled={studentPage === studentTotalPages}
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddStudentsDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleAddStudents} disabled={selectedStudents.length === 0}>
                            Thêm học sinh
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* View Students Dialog */}
            <CustomDialog open={isViewStudentsDialogOpen} onOpenChange={setIsViewStudentsDialogOpen} title={`Danh sách học sinh lớp ${selectedClassForView?.className || ''}`} maxWidth="max-w-4xl">
                <div className="space-y-4 p-5">
                    <div className="border rounded-md shadow-md">
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
                                {getCurrentPageStudents().map((student) => (
                                    <TableRow key={student.userId}>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setStudentToRemove(student);
                                                    setIsRemoveStudentDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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
                    <TablePagination
                        currentPage={currentStudentPage - 1}
                        totalPages={totalStudentPages}
                        totalItems={classStudents.length}
                        onPageChange={(page) => setCurrentStudentPage(page + 1)}
                        itemLabel="học sinh"
                    />
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => {
                            setIsViewStudentsDialogOpen(false);
                            setCurrentStudentPage(1);
                        }} className="shadow-md rounded-md">
                            Xóa
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Remove Student Confirmation Dialog */}
            <CustomDialog open={isRemoveStudentDialogOpen} onOpenChange={setIsRemoveStudentDialogOpen} title="Xóa học sinh khỏi lớp">
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Bạn có chắc chắn muốn xóa học sinh {studentToRemove?.fullName || studentToRemove?.username} khỏi lớp {selectedClassForView?.className}?
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsRemoveStudentDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (studentToRemove) {
                                    handleRemoveStudent(studentToRemove.userId);
                                    setIsRemoveStudentDialogOpen(false);
                                }
                            }}
                        >
                            Xóa
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Delete Confirmation Dialog */}
            <CustomDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Đóng lớp học">
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        Bạn có chắc chắn muốn đóng lớp {classToDelete?.className}? Hành động này không thể hoàn tác.
                    </p>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (classToDelete) {
                                    handleDelete(classToDelete.classId);
                                    setIsDeleteDialogOpen(false);
                                }
                            }}
                        >
                            đóng
                        </Button>
                    </div>
                </div>
            </CustomDialog>
        </div>
    );
} 