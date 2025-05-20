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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { User, UserCreateRequest, UserUpdateRequest } from "@/types/User";
import { getUsers, createUser, updateUser, deleteUser } from '@/api/userApi';
import { toast } from '@/hooks/use-toast';

const roles = [
    { value: "STUDENT", label: "Học sinh" },
    { value: "TEACHER", label: "Giáo viên" },
    { value: "PARENT", label: "Phụ huynh" },
    { value: "ADMIN", label: "Admin" },
];

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserUpdateRequest | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newUser, setNewUser] = useState<UserCreateRequest>({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        dob: new Date().toISOString().split('T')[0],
        role: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getUsers();
            setUsers(response.data.result);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách người dùng",
                variant: "destructive"
            });
        }
    };

    const handleAdd = async () => {
        try {
            const response = await createUser(newUser);
            setUsers([...users, response.data.result]);
            setIsAddDialogOpen(false);
            setNewUser({
                username: "",
                password: "",
                firstName: "",
                lastName: "",
                dob: new Date().toISOString().split('T')[0],
                role: ""
            });
            toast({
                title: "Thành công",
                description: "Thêm người dùng mới thành công"
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể thêm người dùng mới",
                variant: "destructive"
            });
        }
    };

    const handleEdit = async (id: string, user: UserUpdateRequest) => {
        setSelectedUserId(id);
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        try {
            const response = await updateUser(selectedUserId, selectedUser);
            setUsers(users.map(user =>
                user.id === selectedUserId ? response.data.result : user
            ));
            setIsEditDialogOpen(false);
            toast({
                title: "Thành công",
                description: "Cập nhật thông tin người dùng thành công"
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật thông tin người dùng",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            setUsers(users.filter(user => user.id !== id));
            toast({
                title: "Thành công",
                description: "Xóa người dùng thành công"
            });
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể xóa người dùng",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-4">
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
                                <Label htmlFor="firstName" className="text-right">
                                    Tên
                                </Label>
                                <Input
                                    id="firstName"
                                    value={newUser.firstName}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, firstName: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="lastName" className="text-right">
                                    Họ
                                </Label>
                                <Input
                                    id="lastName"
                                    value={newUser.lastName}
                                    onChange={(e) =>
                                        setNewUser({ ...newUser, lastName: e.target.value })
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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Vai trò
                                </Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) =>
                                        setNewUser({
                                            ...newUser,
                                            role: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            <TableHead>Họ</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Ngày sinh</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.lastName || "-"}</TableCell>
                                <TableCell>{user.firstName || "-"}</TableCell>
                                <TableCell>{user.dob || "-"}</TableCell>
                                <TableCell>
                                    {user.role.name}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(
                                            user.id,
                                            {
                                                firstName: user.firstName,
                                                lastName: user.lastName,
                                                dob: user.dob,
                                                role: user.role.name
                                            })
                                        }
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-firstName" className="text-right">
                                    Tên
                                </Label>
                                <Input
                                    id="edit-firstName"
                                    value={selectedUser.firstName || ""}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, firstName: e.target.value })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-lastName" className="text-right">
                                    Họ
                                </Label>
                                <Input
                                    id="edit-lastName"
                                    value={selectedUser.lastName || ""}
                                    onChange={(e) =>
                                        setSelectedUser({ ...selectedUser, lastName: e.target.value })
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
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-role" className="text-right">
                                    Vai trò
                                </Label>
                                <Select
                                    value={selectedUser.role}
                                    onValueChange={(value) =>
                                        setSelectedUser({
                                            ...selectedUser,
                                            role: value
                                        })
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <Button onClick={handleUpdate}>Lưu thay đổi</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 