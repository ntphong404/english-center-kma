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
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Users } from "lucide-react";
import { User, UserCreateRequest, UserUpdateRequest, CreateStudentRequest, CreateTeacherRequest, UpdateStudentRequest, UpdateTeacherRequest, Teacher, Parent, Student } from "@/types/user";
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import studentApi from '@/api/studentApi';
import teacherApi from '@/api/teacherApi';
import parentApi from '@/api/parentApi';
import { userApi } from '@/api/userApi';
import { Checkbox } from "@/components/ui/checkbox";
import { TablePagination } from "@/components/ui/table-pagination";

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
    const [newUser, setNewUser] = useState<Partial<UserCreateRequest>>({
        username: "",
        password: "",
        fullName: "",
        email: "",
        dob: new Date().toISOString().split('T')[0],
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

    useEffect(() => {
        fetchCurrentUsers();
    }, [currentPage, activeTab]);

    useEffect(() => {
        if (isAddStudentsDialogOpen) {
            fetchAvailableStudents(studentPage);
        }
    }, [studentPage, isAddStudentsDialogOpen]);

    const fetchCurrentUsers = async () => {
        try {
            let response;
            switch (activeTab) {
                case 'STUDENT':
                    response = await studentApi.getAll(currentPage, ITEMS_PER_PAGE, 'fullName,asc');
                    setStudents(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
                case 'TEACHER':
                    response = await teacherApi.getAll(currentPage, ITEMS_PER_PAGE, 'fullName,asc');
                    setTeachers(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
                case 'PARENT':
                    response = await parentApi.getAll(currentPage, ITEMS_PER_PAGE, 'fullName,asc');
                    setParents(response.data.result.content);
                    setTotalPages(response.data.result.page.totalPages);
                    setTotalElements(response.data.result.page.totalElements);
                    break;
                case 'ADMIN':
                    response = await userApi.getByRoleName('ADMIN', currentPage, ITEMS_PER_PAGE, 'fullName,asc');
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
                dob: newUser.dob || new Date().toISOString().split('T')[0],
            };

            switch (activeTab) {
                case 'STUDENT':
                    response = await studentApi.create({
                        ...baseUserData,
                        classDiscounts: []
                    });
                    break;
                case 'TEACHER':
                    response = await teacherApi.create({
                        ...baseUserData,
                        salary: 0
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
                dob: new Date().toISOString().split('T')[0],
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
                    response = await studentApi.update(selectedUserId, selectedUser as UpdateStudentRequest);
                    break;
                case 'TEACHER':
                    response = await teacherApi.update(selectedUserId, selectedUser as UpdateTeacherRequest);
                    break;
                case 'PARENT':
                    response = await parentApi.update(selectedUserId, selectedUser);
                    break;
                case 'ADMIN':
                    response = await userApi.update(selectedUserId, selectedUser);
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
            const response = await studentApi.getAll(page - 1, STUDENT_PAGE_SIZE, 'userId,ASC');
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

    return (
        <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                setCurrentPage(0);
            }}>
                <TabsList>
                    <TabsTrigger value="STUDENT">Student</TabsTrigger>
                    <TabsTrigger value="PARENT">Parent</TabsTrigger>
                    <TabsTrigger value="TEACHER">Teacher</TabsTrigger>
                    <TabsTrigger value="ADMIN">Admin</TabsTrigger>
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
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm người dùng mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    Tên đăng nhập
                                </Label>
                                <Input
                                    id="username"
                                    value={newUser.username}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, username: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="password" className="text-right">
                                    Mật khẩu
                                </Label>
                                <Input
                                    id="password"
                                    value={newUser.password}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, password: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullName" className="text-right">
                                    Họ và tên
                                </Label>
                                <Input
                                    id="fullName"
                                    value={newUser.fullName}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, fullName: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    value={newUser.email}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, email: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dob" className="text-right">
                                    Ngày sinh
                                </Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={newUser.dob}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, dob: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAdd}>Thêm người dùng</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên đăng nhập</TableHead>
                            <TableHead>Họ và tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ngày sinh</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {getCurrentUsers().map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.fullName || "-"}</TableCell>
                                <TableCell>{user.email || "-"}</TableCell>
                                <TableCell>{user.dob || "-"}</TableCell>
                                <TableCell className="text-right">
                                    {activeTab === 'PARENT' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedParent(user as Parent);
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
                                                    setSelectedParent(user as Parent);
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
                                                fullName: user.fullName,
                                                email: user.email,
                                                dob: user.dob,
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
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Add empty rows to maintain fixed height */}
                        {getCurrentUsers().length < ITEMS_PER_PAGE &&
                            Array.from({ length: ITEMS_PER_PAGE - getCurrentUsers().length }).map((_, index) => (
                                <TableRow key={`empty-${index}`}>
                                    <TableCell colSpan={6} className="h-[53px]"></TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalElements}
                onPageChange={handlePageChange}
                itemLabel="người dùng"
            />

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-fullName" className="text-right">
                                    Họ và tên
                                </Label>
                                <Input
                                    id="edit-fullName"
                                    value={selectedUser.fullName || ""}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, fullName: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    value={selectedUser.email || ""}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, email: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-dob" className="text-right">
                                    Ngày sinh
                                </Label>
                                <Input
                                    id="edit-dob"
                                    type="date"
                                    value={selectedUser.dob || ""}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, dob: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button onClick={handleEdit}>Lưu thay đổi</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Students Dialog */}
            <Dialog open={isViewStudentsDialogOpen} onOpenChange={setIsViewStudentsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Danh sách học sinh của phụ huynh {selectedParent?.fullName}</DialogTitle>
                    </DialogHeader>
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
                </DialogContent>
            </Dialog>

            {/* Add Students Dialog */}
            <Dialog open={isAddStudentsDialogOpen} onOpenChange={setIsAddStudentsDialogOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Thêm học sinh cho phụ huynh {selectedParent?.fullName}</DialogTitle>
                    </DialogHeader>
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
                </DialogContent>
            </Dialog>

            {/* Confirm Add Dialog */}
            <Dialog open={isConfirmAddDialogOpen} onOpenChange={setIsConfirmAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận thêm học sinh</DialogTitle>
                    </DialogHeader>
                    <div>Bạn có chắc muốn thêm học sinh <b>{studentToAdd?.fullName}</b> vào phụ huynh này không?</div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsConfirmAddDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmAddStudent}>Thêm</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Remove Dialog */}
            <Dialog open={isConfirmRemoveDialogOpen} onOpenChange={setIsConfirmRemoveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa học sinh</DialogTitle>
                    </DialogHeader>
                    <div>Bạn có chắc muốn xóa học sinh <b>{studentToRemove?.fullName}</b> khỏi phụ huynh này không?</div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsConfirmRemoveDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmRemoveStudent}>Xóa</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
                    </DialogHeader>
                    <div>Bạn có chắc muốn xóa người dùng <b>{userToDelete?.fullName || userToDelete?.username}</b> không?</div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

