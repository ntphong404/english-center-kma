import React, { useEffect, useRef, useState, useCallback } from 'react';
import { bannerCourseApi } from '@/api/bannerCourseApi';
import { uploadApi } from '@/api/uploadApi';
import { BannerCourseResponse, CreateBannerCourseRequest, UpdateBannerCourseRequest } from '@/types/bannercourse';
import { ApiResponse, PageResponse } from '@/types/api';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useDebouncedCallback } from 'use-debounce';

const PAGE_SIZE = 10;

const initialForm = {
    title: '',
    description: '',
    image: null as File | null,
};

const Banner = () => {
    const { toast } = useToast();
    const [banners, setBanners] = useState<BannerCourseResponse[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // Dialog states
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<BannerCourseResponse | null>(null);

    // Form states
    const [form, setForm] = useState<CreateBannerCourseRequest>({
        title: '',
        description: '',
        image: null as any,
    });
    const [editForm, setEditForm] = useState<UpdateBannerCourseRequest>({
        title: '',
        description: '',
        image: null as any,
    });
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const fetchBanners = useCallback(async (pageNum = 0, title = '', description = '') => {
        setLoading(true);
        try {
            let response;
            if (title || description) {
                response = await bannerCourseApi.getAll(title, description, pageNum, PAGE_SIZE);
            } else {
                response = await bannerCourseApi.getAll("", "", pageNum, PAGE_SIZE);
            }
            if (response.data.code === 200) {
                setBanners(response.data.result.content);
                setTotalPages(response.data.result.page.totalPages);
                setTotalItems(response.data.result.page.totalElements);
            }
        } catch (error) {
            setBanners([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search function
    const debouncedSearch = useDebouncedCallback((searchTerm: string) => {
        setPage(0);
        // Split search term to search in both title and description
        fetchBanners(0, searchTerm, "");
    }, 500); // 500ms delay

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    useEffect(() => {
        fetchBanners(page, search);
        // eslint-disable-next-line
    }, [page]);

    // Thêm mới banner
    const handleAddBanner = async () => {
        if (!form.title || !form.image) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập tiêu đề và chọn ảnh.', variant: 'destructive' });
            return;
        }

        setCreating(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('image', form.image);

            await bannerCourseApi.create(formData);
            toast({ title: 'Thành công', description: 'Đã thêm banner mới.' });
            setOpenAdd(false);
            setForm(initialForm);
            fetchBanners(page, search);
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể thêm banner.', variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    // Sửa banner
    const handleEditBanner = async () => {
        if (!selectedBanner) return;
        // Nếu tất cả các trường đều rỗng thì báo lỗi
        if (!editForm.title && !editForm.description && !editForm.image) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập thông tin cần cập nhật.', variant: 'destructive' });
            return;
        }

        setUpdating(true);
        try {
            const formData = new FormData();
            if (editForm.title) formData.append('title', editForm.title);
            if (editForm.description) formData.append('description', editForm.description);
            if (editForm.image) formData.append('image', editForm.image);

            await bannerCourseApi.patch(selectedBanner.bannerCourseId, formData);
            toast({ title: 'Thành công', description: 'Đã cập nhật banner.' });
            setOpenEdit(false);
            setEditForm(initialForm);
            setSelectedBanner(null);
            fetchBanners(page, search);
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể cập nhật banner.', variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    // Xóa banner
    const handleDeleteBanner = async () => {
        if (!selectedBanner) return;
        try {
            await bannerCourseApi.delete(selectedBanner.bannerCourseId);
            toast({ title: 'Thành công', description: 'Đã xóa banner.' });
            setOpenDelete(false);
            setSelectedBanner(null);
            fetchBanners(page, search);
        } catch (error) {
            toast({ title: 'Lỗi', description: 'Không thể xóa banner.', variant: 'destructive' });
        }
    };

    // Upload ảnh cho form thêm
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setForm(prev => ({ ...prev, image: file }));
        toast({ title: 'Thành công', description: 'Đã chọn ảnh.' });
    };

    // Upload ảnh cho form sửa
    const handleEditUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setEditForm(prev => ({ ...prev, image: file }));
        toast({ title: 'Thành công', description: 'Đã chọn ảnh.' });
    };

    // Mở dialog sửa
    const openEditDialog = (banner: BannerCourseResponse) => {
        setSelectedBanner(banner);
        setEditForm({
            title: banner.title,
            description: banner.description,
            image: null as any,
        });
        setOpenEdit(true);
    };

    // Mở dialog xóa
    const openDeleteDialog = (banner: BannerCourseResponse) => {
        setSelectedBanner(banner);
        setOpenDelete(true);
    };

    return (
        <div className="p-4">
            <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-2xl font-bold">Quản lý Banner</h2>
                <div className="flex justify-end items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm banner..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-64"
                    />
                    <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                        <DialogTrigger asChild>
                            <Button type="button" className="ml-2" variant="default">
                                <Plus className="w-4 h-4 mr-2" /> Thêm mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Thêm banner mới</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    placeholder="Tiêu đề"
                                    value={form.title}
                                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                                <Input
                                    placeholder="Mô tả"
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleUpload}
                                        className="w-auto"
                                    />
                                    {form.image && (
                                        <img src={URL.createObjectURL(form.image)} alt="preview" className="h-16 w-32 object-cover rounded" />
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddBanner} disabled={creating}>
                                    {creating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tạo...
                                        </>
                                    ) : (
                                        'Lưu'
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => setOpenAdd(false)} disabled={creating}>Hủy</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">STT</TableHead>
                            <TableHead className="text-center">Tiêu đề</TableHead>
                            <TableHead className="text-center">Mô tả</TableHead>
                            <TableHead className="text-center">Ảnh</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">Đang tải...</TableCell></TableRow>
                        ) : banners.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-4">Không có dữ liệu</TableCell></TableRow>
                        ) : (
                            banners.map((banner, idx) => (
                                <TableRow key={banner.bannerCourseId}>
                                    <TableCell className="text-center">{page * PAGE_SIZE + idx + 1}</TableCell>
                                    <TableCell className="text-center">{banner.title}</TableCell>
                                    <TableCell className="text-center">{banner.description}</TableCell>
                                    <TableCell className="text-center">
                                        <img src={banner.imageUrl} alt={banner.title} className="h-16 w-32 object-cover rounded mx-auto" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(banner)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => openDeleteDialog(banner)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setPage}
                itemLabel="banner"
            />

            {/* Dialog sửa banner */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa banner</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Tiêu đề"
                            value={editForm.title}
                            onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Input
                            placeholder="Mô tả"
                            value={editForm.description}
                            onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                ref={editFileInputRef}
                                onChange={handleEditUpload}
                                className="w-auto"
                            />
                            {editForm.image && (
                                <img src={URL.createObjectURL(editForm.image)} alt="preview" className="h-16 w-32 object-cover rounded" />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditBanner} disabled={updating}>
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                'Lưu'
                            )}
                        </Button>
                        <Button variant="outline" onClick={() => setOpenEdit(false)} disabled={updating}>Hủy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xóa banner</DialogTitle>
                        <DialogDescription>Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDelete(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDeleteBanner}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Banner;