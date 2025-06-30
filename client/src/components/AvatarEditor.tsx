import React, { useState, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { userApi } from '@/api/userApi';
import { getUser, setUser } from '@/store/userStore';
import Cropper from 'react-easy-crop';

interface AvatarEditorProps {
    currentAvatar?: string;
    username: string;
    onAvatarChange: (file: File, url?: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', error => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob) {
                const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                resolve(file);
            } else {
                reject(new Error('Canvas is empty'));
            }
        }, 'image/jpeg', 0.95);
    });
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({
    currentAvatar,
    username,
    onAvatarChange,
    isOpen,
    onClose
}) => {
    const { toast } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Lỗi",
                    description: "File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.",
                    variant: "destructive"
                });
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Lỗi",
                    description: "Vui lòng chọn file ảnh hợp lệ.",
                    variant: "destructive"
                });
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onCropComplete = useCallback((_: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleSave = useCallback(async () => {
        if (!selectedFile || !previewUrl || !croppedAreaPixels) return;
        setIsLoading(true);
        try {
            const croppedFile = await getCroppedImg(previewUrl, croppedAreaPixels);
            const res = await userApi.changeAvatar(croppedFile);

            // Cập nhật user data trong localStorage
            const currentUser = getUser();
            if (currentUser && res.data.result) {
                const updatedUser = { ...currentUser, avatarUrl: res.data.result.avatarUrl };
                setUser(updatedUser);
            }

            toast({ title: "Thành công", description: "Đã cập nhật ảnh đại diện." });
            onAvatarChange(croppedFile, res.data.result.avatarUrl || undefined);
            handleClose();
        } catch (err) {
            toast({ title: "Lỗi", description: "Không thể cập nhật ảnh đại diện.", variant: "destructive" });
        }
        setIsLoading(false);
    }, [selectedFile, previewUrl, croppedAreaPixels, toast, onAvatarChange]);

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {!selectedFile ? (
                        <div className="flex flex-col items-center space-y-4 py-8">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={currentAvatar} alt={username} />
                                <AvatarFallback className="text-lg">
                                    {username.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Chọn ảnh để cập nhật ảnh đại diện
                                </p>
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    <Camera className="w-4 h-4 mr-2" />
                                    Chọn ảnh
                                </Button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative w-full h-[400px] bg-black rounded-lg overflow-hidden">
                                <Cropper
                                    image={previewUrl}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape="rect"
                                    showGrid={false}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onCropComplete={onCropComplete}
                                />
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom(z => Math.max(z - 0.1, 1))}
                                    disabled={zoom <= 1}
                                >
                                    -
                                </Button>
                                <span className="px-2">{Math.round(zoom * 100)}%</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom(z => Math.min(z + 0.1, 3))}
                                    disabled={zoom >= 3}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                    </Button>
                    {selectedFile && (
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Check className="w-4 h-4 mr-2" />
                            {isLoading ? 'Đang xử lý...' : 'Lưu'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AvatarEditor; 