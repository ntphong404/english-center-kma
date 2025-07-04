import { useState, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Users, ChevronUp, ChevronDown, ListOrdered, ArrowDownNarrowWide, ArrowUpWideNarrow } from "lucide-react";
import { User, UserCreateRequest, UserUpdateRequest, CreateStudentRequest, CreateTeacherRequest, UpdateStudentRequest, UpdateTeacherRequest, Teacher, Parent, Student } from "@/types/user";
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import studentApi from '@/api/studentApi';
import teacherApi from '@/api/teacherApi';
import parentApi from '@/api/parentApi';
import { userApi } from '@/api/userApi';
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/ui/table-pagination";
import debounce from "lodash.debounce";
import { classApi } from '@/api/classApi';
import { ClassResponse } from '@/types/entityclass';
import ColoredTable from '@/components/ui/ColoredTable';
import CustomDialog from '@/components/CustomDialog';

const ITEMS_PER_PAGE = 6;

const roles = [
    { value: "STUDENT", label: "Học sinh" },
    { value: "TEACHER", label: "Giáo viên" },
    { value: "PARENT", label: "Phụ huynh" },
    { value: "ADMIN", label: "Admin" },
];

export default function AdminUsers() {
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [parents, setParents] = useState<Parent[]>([]);
    const [admins, setAdmins] = useState<User[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserUpdateRequest | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newUser, setNewUser] = useState<Partial<UserCreateRequest> & { salary?: number }>({
        username: "",
        password: "",
        fullName: "",
        email: "",
        gender: "MALE",
        phoneNumber: "",
        address: "",
        dob: new Date().toISOString().split('T')[0],
        salary: 0,
    });
    const [activeTab, setActiveTab] = useState('STUDENT');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isViewStudentsDialogOpen, setIsViewStudentsDialogOpen] = useState(false);
    const [isAddStudentsDialogOpen, setIsAddStudentsDialogOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const [parentStudents, setParentStudents] = useState<Student[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [studentPage, setStudentPage] = useState(1);
    const [studentTotalPages, setStudentTotalPages] = useState(1);
    const [studentTotalItems, setStudentTotalItems] = useState(0);
    const STUDENT_PAGE_SIZE = 6;
    const [isConfirmAddDialogOpen, setIsConfirmAddDialogOpen] = useState(false);
    const [isConfirmRemoveDialogOpen, setIsConfirmRemoveDialogOpen] = useState(false);
    const [studentToAdd, setStudentToAdd] = useState<Student | null>(null);
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchName, setSearchName] = useState("");
    const [sortField, setSortField] = useState("fullName");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>("asc");
    const [allClasses, setAllClasses] = useState<ClassResponse[]>([]);
    const [classDiscounts, setClassDiscounts] = useState<{ classId: string; discount: number }[]>([]);

    useEffect(() => {
        fetchCurrentUsers();
    }, [currentPage, activeTab, searchName, sortField, sortOrder]);

    useEffect(() => {
        if (isAddStudentsDialogOpen) {
            fetchAvailableStudents(studentPage);
        }
    }, [studentPage, isAddStudentsDialogOpen]);

    useEffect(() => {
        if (isEditDialogOpen && activeTab === 'STUDENT' && selectedUserId) {
            (async () => {
                const res = await classApi.getAll(undefined, undefined, selectedUserId);
                const classes = res.data.result.content;
                setAllClasses(classes);
                // Lấy discount từ student nếu có
                const student = students.find(s => s.userId === selectedUserId);
                setClassDiscounts(
                    classes.map(cls => {
                        const found = student?.classDiscounts?.find(cd => cd.classId === cls.classId);
                        return { classId: cls.classId, discount: found ? found.discount : 0 };
                    })
                );
            })();
        }
    }, [isEditDialogOpen, activeTab, selectedUserId]);

    const fetchCurrentUsers = async () => {
        try {
            let response;
            const sortParam = `${sortField},${sortOrder}`;
            switch (activeTab) {
                case 'STUDENT':
                    response = await studentApi.getAll(searchName || undefined, undefined, currentPage, ITEMS_PER_PAGE, sortParam);
                    setStudents(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
                case 'TEACHER':
                    response = await teacherApi.getAll(searchName || undefined, undefined, currentPage, ITEMS_PER_PAGE, sortParam);
                    setTeachers(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
                case 'PARENT':
                    response = await parentApi.getAll(searchName || undefined, undefined, currentPage, ITEMS_PER_PAGE, sortParam);
                    setParents(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
                case 'ADMIN':
                    response = await userApi.getByRoleName('ADMIN', currentPage, ITEMS_PER_PAGE, sortParam);
                    setAdmins(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
            }
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách người dùng",
                variant: "destructive"
            });
        }
    };

    const getCurrentUsers = () => {
        switch (activeTab) {
            case 'STUDENT':
                return students;
            case 'TEACHER':
                return teachers;
            case 'PARENT':
                return parents;
            case 'ADMIN':
                return admins;
            default:
                return [];
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleAdd = async () => {
        try {
            let response;
            const baseUserData = {
                username: newUser.username || "",
                password: newUser.password || "",
                fullName: newUser.fullName || "",
                email: newUser.email || "",
                gender: newUser.gender || "",
                phoneNumber: newUser.phoneNumber || "",
                address: newUser.address || "",
                dob: newUser.dob || new Date().toISOString().split('T')[0],
            };

            switch (activeTab) {
                case 'STUDENT':
                    response = await studentApi.create({
                        ...baseUserData
                    } as CreateStudentRequest);
                    break;
                case 'TEACHER':
                    response = await teacherApi.create({
                        ...baseUserData,
                        salary: newUser.salary || 0
                    });
                    break;
                case 'PARENT':
                    response = await parentApi.create(baseUserData);
                    break;
                case 'ADMIN':
                    response = await userApi.create(baseUserData);
                    break;
            }


            // Reset form and close dialog first
            setNewUser({
                username: "",
                password: "",
                fullName: "",
                email: "",
                gender: "MALE",
                phoneNumber: "",
                address: "",
                dob: new Date().toISOString().split('T')[0],
                salary: 0,
            });
            setIsAddDialogOpen(false);

            // Show success message
            toast({
                title: "Thành công",
                description: "Tạo người dùng thành công",
            });

            // Fetch updated data
            await fetchCurrentUsers();

        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tạo người dùng",
                variant: "destructive"
            });
        }
    };

    const handleClickDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            let response;
            switch (activeTab) {
                case 'STUDENT':
                    response = await studentApi.delete(userToDelete.userId);
                    break;
                case 'TEACHER':
                    response = await teacherApi.delete(userToDelete.userId);
                    break;
                case 'PARENT':
                    response = await parentApi.delete(userToDelete.userId);
                    break;
                case 'ADMIN':
                    response = await userApi.delete(userToDelete.userId);
                    break;
            }


            toast({
                title: "Thành công",
                description: "Xóa người dùng thành công",
            });
            await fetchCurrentUsers();

        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa người dùng",
                variant: "destructive"
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleEdit = async () => {
        if (!selectedUserId || !selectedUser) return;

        try {
            let response;
            switch (activeTab) {
                case 'STUDENT':
                    response = await studentApi.patch(selectedUserId, {
                        ...selectedUser,
                        classDiscounts: classDiscounts.map(d => ({ classId: d.classId, discount: d.discount }))
                    } as UpdateStudentRequest);
                    break;
                case 'TEACHER':
                    response = await teacherApi.patch(selectedUserId, {
                        ...selectedUser,
                        salary: (selectedUser as any).salary || 0
                    } as UpdateTeacherRequest);
                    break;
                case 'PARENT':
                    response = await parentApi.patch(selectedUserId, selectedUser as UserUpdateRequest);
                    break;
                case 'ADMIN':
                    response = await userApi.patch(selectedUserId, selectedUser);
                    break;
            }


            toast({
                title: "Thành công",
                description: "Cập nhật người dùng thành công",
            });
            setIsEditDialogOpen(false);
            setSelectedUser(null);
            setSelectedUserId(null);
            await fetchCurrentUsers();

        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật người dùng",
                variant: "destructive"
            });
        }
    };

    const fetchParentStudents = async (parentId: string) => {
        try {
            const response = await parentApi.getById(parentId);
            if (response.data.result) {
                const parent = response.data.result;
                if (parent.studentIds && parent.studentIds.length > 0) {
                    const studentsResponse = await studentApi.getByIds(parent.studentIds);
                    if (studentsResponse.data.result) {
                        setParentStudents(studentsResponse.data.result);
                    }
                } else {
                    setParentStudents([]);
                }
            }
        } catch (error) {
            console.error("Error fetching parent students:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách học sinh",
                variant: "destructive"
            });
        }
    };

    const fetchAvailableStudents = async (page: number) => {
        try {
            const response = await studentApi.getAll(undefined, undefined, page - 1, STUDENT_PAGE_SIZE, 'userId,ASC');
            const pageResponse = response.data.result;
            if (pageResponse) {
                setAvailableStudents(pageResponse.content);
                setStudentTotalPages(pageResponse.page.totalPages);
                setStudentTotalItems(pageResponse.page.totalElements);
            }
        } catch (error) {
            console.error("Error fetching available students:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách học sinh",
                variant: "destructive"
            });
        }
    };

    const handleAddStudents = async () => {
        if (!selectedParent || selectedStudents.length === 0) return;

        try {
            await parentApi.addStudent(selectedParent.userId, selectedStudents[0]);
            toast({
                title: "Thành công",
                description: "Thêm học sinh thành công",
            });
            setIsAddStudentsDialogOpen(false);
            setSelectedStudents([]);
            fetchParentStudents(selectedParent.userId);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể thêm học sinh",
                variant: "destructive"
            });
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedParent) return;

        try {
            await parentApi.removeStudent(selectedParent.userId, studentId);
            toast({
                title: "Thành công",
                description: "Xóa học sinh thành công",
            });
            fetchParentStudents(selectedParent.userId);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa học sinh",
                variant: "destructive"
            });
        }
    };

    // When clicking plus button, open confirm dialog
    const handleClickAddStudent = (student: Student) => {
        setStudentToAdd(student);
        setIsConfirmAddDialogOpen(true);
    };

    // When clicking remove button, open confirm dialog
    const handleClickRemoveStudent = (student: Student) => {
        setStudentToRemove(student);
        setIsConfirmRemoveDialogOpen(true);
    };

    // Confirm add student
    const handleConfirmAddStudent = async () => {
        if (!selectedParent || !studentToAdd) return;
        try {
            await parentApi.addStudent(selectedParent.userId, studentToAdd.userId);
            toast({
                title: "Thành công",
                description: "Thêm học sinh thành công",
            });
            setIsAddStudentsDialogOpen(false);
            setSelectedStudents([]);
            fetchParentStudents(selectedParent.userId);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể thêm học sinh",
                variant: "destructive"
            });
        } finally {
            setIsConfirmAddDialogOpen(false);
            setStudentToAdd(null);
        }
    };

    // Confirm remove student
    const handleConfirmRemoveStudent = async () => {
        if (!selectedParent || !studentToRemove) return;
        try {
            await parentApi.removeStudent(selectedParent.userId, studentToRemove.userId);
            toast({
                title: "Thành công",
                description: "Xóa học sinh thành công",
            });
            fetchParentStudents(selectedParent.userId);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa học sinh",
                variant: "destructive"
            });
        } finally {
            setIsConfirmRemoveDialogOpen(false);
            setStudentToRemove(null);
        }
    };

    // Debounce search
    const handleSearch = debounce((value: string) => {
        setSearchName(value);
        setCurrentPage(0);
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
            <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
            <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                setCurrentPage(0);
            }}>
                <TabsList className="border rounded-md flex gap-1 p-0.5 mb-4 bg-transparent">
                    <TabsTrigger value="STUDENT" className="data-[state=active]:bg-[#3b70c6] data-[state=active]:text-white data-[state=active]:font-medium bg-transparent text-gray-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md transition">Student</TabsTrigger>
                    <TabsTrigger value="PARENT" className="data-[state=active]:bg-[#3b70c6] data-[state=active]:text-white data-[state=active]:font-medium bg-transparent text-gray-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md transition">Parent</TabsTrigger>
                    <TabsTrigger value="TEACHER" className="data-[state=active]:bg-[#3b70c6] data-[state=active]:text-white data-[state=active]:font-medium bg-transparent text-gray-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md transition">Teacher</TabsTrigger>
                    <TabsTrigger value="ADMIN" className="data-[state=active]:bg-[#3b70c6] data-[state=active]:text-white data-[state=active]:font-medium bg-transparent text-gray-700 hover:bg-gray-100 font-medium px-4 py-1.5 rounded-md transition">Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="STUDENT">
                    {/* Student tab content */}
                </TabsContent>
                <TabsContent value="PARENT">
                    {/* Parent tab content */}
                </TabsContent>
                <TabsContent value="TEACHER">
                    {/* Teacher tab content */}
                </TabsContent>
                <TabsContent value="ADMIN">
                    {/* Admin tab content */}
                </TabsContent>
            </Tabs>
            <div className="flex items-center justify-end gap-2 mb-2">
                <Input
                    placeholder="Tìm theo tên..."
                    defaultValue={searchName}
                    onChange={e => handleSearch(e.target.value)}
                    className="w-64"
                />
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
                        </Button>
                    </DialogTrigger>
                    <CustomDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} title="Thêm người dùng mới">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">Tên đăng nhập</Label>
                                <Input id="username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">Mật khẩu</Label>
                                <Input id="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">Họ và tên</Label>
                                <Input id="fullName" value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dob" className="text-right">Ngày sinh</Label>
                                <Input id="dob" type="date" value={newUser.dob} onChange={e => setNewUser({ ...newUser, dob: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="gender" className="text-right">Giới tính</Label>
                                <Select value={newUser.gender || "MALE"} onValueChange={val => setNewUser({ ...newUser, gender: val })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Nam</SelectItem>
                                        <SelectItem value="FEMALE">Nữ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phoneNumber" className="text-right">Số điện thoại</Label>
                                <Input id="phoneNumber" value={newUser.phoneNumber} onChange={e => setNewUser({ ...newUser, phoneNumber: e.target.value })} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">Địa chỉ</Label>
                                <Input id="address" value={newUser.address} onChange={e => setNewUser({ ...newUser, address: e.target.value })} className="col-span-3" />
                            </div>
                            {activeTab === 'TEACHER' && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="salary" className="text-right">Lương</Label>
                                    <Input id="salary" type="number" value={newUser.salary || 0} onChange={e => setNewUser({ ...newUser, salary: Number(e.target.value) })} className="col-span-3" />
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAdd}>Thêm người dùng</Button>
                        </div>
                    </CustomDialog>
                </Dialog>
            </div>

            <ColoredTable
                columns={[
                    { title: 'Tên đăng nhập', sortable: true, sortField: 'username' },
                    { title: 'Họ và tên', sortable: true, sortField: 'fullName' },
                    { title: 'Email', sortable: true, sortField: 'email' },
                    { title: 'Ngày sinh', sortable: true, sortField: 'dob' },
                    { title: 'Thao tác', headerClassName: 'text-right' },
                ]}
                data={getCurrentUsers()}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                pageSize={ITEMS_PER_PAGE}
                renderRow={(user) => [
                    user.username,
                    user.fullName || '-',
                    user.email || '-',
                    user.dob || '-',
                    <div className="text-right" key="actions">
                        {activeTab === 'PARENT' && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedParent(user);
                                        fetchParentStudents(user.userId);
                                        setIsViewStudentsDialogOpen(true);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedParent(user);
                                        setSelectedStudents([]);
                                        setStudentPage(1);
                                        fetchAvailableStudents(1);
                                        setIsAddStudentsDialogOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSelectedUserId(user.userId);
                                setSelectedUser({
                                    fullName: user.fullName || "",
                                    email: user.email || "",
                                    gender: user.gender || "MALE",
                                    phoneNumber: user.phoneNumber || "",
                                    address: user.address || "",
                                    dob: user.dob || "",
                                    ...(activeTab === 'TEACHER' ? { salary: (user).salary || 0 } : {})
                                });
                                setIsEditDialogOpen(true);
                            }}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleClickDelete(user)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ]}
            />

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalElements}
                onPageChange={handlePageChange}
                itemLabel="người dùng"
            />

            {/* Chỉnh sửa dialog chỉnh sửa người dùng */}
            <CustomDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} title="Chỉnh sửa thông tin người dùng">
                {selectedUser && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-fullName" className="text-right">Họ và tên</Label>
                            <Input id="edit-fullName" value={selectedUser.fullName || ""} onChange={e => setSelectedUser({ ...selectedUser, fullName: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-email" className="text-right">Email</Label>
                            <Input id="edit-email" value={selectedUser.email || ""} onChange={e => setSelectedUser({ ...selectedUser, email: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-dob" className="text-right">Ngày sinh</Label>
                            <Input id="edit-dob" type="date" value={selectedUser.dob || ""} onChange={e => setSelectedUser({ ...selectedUser, dob: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-gender" className="text-right">Giới tính</Label>
                            <Select value={selectedUser.gender || "MALE"} onValueChange={val => setSelectedUser({ ...selectedUser, gender: val })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Nam</SelectItem>
                                    <SelectItem value="FEMALE">Nữ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-phoneNumber" className="text-right">Số điện thoại</Label>
                            <Input id="edit-phoneNumber" value={selectedUser.phoneNumber || ""} onChange={e => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-address" className="text-right">Địa chỉ</Label>
                            <Input id="edit-address" value={selectedUser.address || ""} onChange={e => setSelectedUser({ ...selectedUser, address: e.target.value })} className="col-span-3" />
                        </div>
                        {activeTab === 'TEACHER' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-salary" className="text-right">Lương</Label>
                                <Input id="edit-salary" type="number" value={(selectedUser as any).salary || 0} onChange={e => setSelectedUser({ ...selectedUser, salary: Number(e.target.value) } as any)} className="col-span-3" />
                            </div>
                        )}
                        {activeTab === 'STUDENT' && (
                            <>
                                <div className="mb-2 font-semibold">Danh sách lớp & Discount (%)</div>
                                <div className="space-y-2">
                                    {allClasses.map((cls, idx) => (
                                        <div key={cls.classId} className="flex items-center gap-2">
                                            <span className="w-48">{cls.className}</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={99}
                                                value={classDiscounts[idx]?.discount ?? 0}
                                                onChange={e => {
                                                    const val = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
                                                    setClassDiscounts(discounts => discounts.map((d, i) => i === idx ? { ...d, discount: val } : d));
                                                }}
                                                className="w-20"
                                            />
                                            <span>%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
                <div className="flex justify-end">
                    <Button onClick={handleEdit}>Lưu thay đổi</Button>
                </div>
            </CustomDialog>

            {/* Xem danh sách học sinh của phụ huynh */}
            <CustomDialog open={isViewStudentsDialogOpen} onOpenChange={setIsViewStudentsDialogOpen} title={`Danh sách học sinh của phụ huynh ${selectedParent?.fullName}`}>
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
                                {parentStudents.map((student) => (
                                    <TableRow key={student.userId}>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleClickRemoveStudent(student)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell>{student.fullName || student.username}</TableCell>
                                        <TableCell>{student.dob || "-"}</TableCell>
                                        <TableCell>{student.email || "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setIsViewStudentsDialogOpen(false)}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Thêm học sinh cho phụ huynh */}
            <CustomDialog open={isAddStudentsDialogOpen} onOpenChange={setIsAddStudentsDialogOpen} title={`Thêm học sinh cho phụ huynh ${selectedParent?.fullName}`}>
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
                                {availableStudents.map((student) => (
                                    <TableRow key={student.userId}>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleClickAddStudent(student)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                        <TableCell>{student.fullName || student.username}</TableCell>
                                        <TableCell>{student.dob || "-"}</TableCell>
                                        <TableCell>{student.email || "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            Chọn học sinh để thêm
                        </div>
                        <TablePagination
                            currentPage={studentPage - 1}
                            totalPages={studentTotalPages}
                            totalItems={studentTotalItems}
                            onPageChange={(page) => setStudentPage(page + 1)}
                            itemLabel="học sinh"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setIsAddStudentsDialogOpen(false)}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </CustomDialog>

            {/* Xác nhận thêm học sinh */}
            <CustomDialog open={isConfirmAddDialogOpen} onOpenChange={setIsConfirmAddDialogOpen} title="Xác nhận thêm học sinh">
                <div>Bạn có chắc muốn thêm học sinh <b>{studentToAdd?.fullName}</b> vào phụ huynh này không?</div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsConfirmAddDialogOpen(false)}>Hủy</Button>
                    <Button variant="destructive" onClick={handleConfirmAddStudent}>Thêm</Button>
                </div>
            </CustomDialog>

            {/* Xác nhận xóa học sinh */}
            <CustomDialog open={isConfirmRemoveDialogOpen} onOpenChange={setIsConfirmRemoveDialogOpen} title="Xác nhận xóa học sinh">
                <div>Bạn có chắc muốn xóa học sinh <b>{studentToRemove?.fullName}</b> khỏi phụ huynh này không?</div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsConfirmRemoveDialogOpen(false)}>Hủy</Button>
                    <Button variant="destructive" onClick={handleConfirmRemoveStudent}>Xóa</Button>
                </div>
            </CustomDialog>

            {/* Xác nhận xóa người dùng */}
            <CustomDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} title="Xác nhận xóa người dùng">
                <div>Bạn có chắc muốn xóa người dùng <b>{userToDelete?.fullName || userToDelete?.username}</b> không?</div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                    <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                </div>
            </CustomDialog>
        </div>
    );
}


