import { useEffect, useState, useRef } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import parentApi from '@/api/parentApi';
import { userApi } from '@/api/userApi';
import { Parent, Notification } from '@/types/user';
import Select from 'react-select';
import { useToast } from '@/hooks/use-toast';

export default function ContactParent() {
    const [parents, setParents] = useState<Parent[]>([]);
    const [parentSearch, setParentSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<Notification[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [loadingParents, setLoadingParents] = useState(false);
    const { toast } = useToast();

    // Debounce parent search
    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setDebouncedSearch(parentSearch);
        }, 500);
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [parentSearch]);

    // Load parents when debouncedSearch changes
    useEffect(() => {
        loadParents(debouncedSearch);
    }, [debouncedSearch]);

    // Load all parents (or by search)
    const loadParents = async (search: string = '') => {
        setLoadingParents(true);
        try {
            const res = await parentApi.getAll(search, undefined, 0, 20);
            setParents(res.data.result.content);
        } catch {
            setParents([]);
        }
        setLoadingParents(false);
    };

    // Load contact history
    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await userApi.getNotification();
            let notifications: any = [];
            if (Array.isArray(res.data.result)) {
                notifications = res.data.result;
            } else if (res.data.result && Array.isArray(res.data.result.content)) {
                notifications = res.data.result.content;
            }
            const validNotifications = (Array.isArray(notifications) ? notifications : []).filter(
                (item): item is Notification =>
                    item && typeof item.notificationId === 'string' &&
                    typeof item.recipientName === 'string' &&
                    typeof item.subject === 'string' &&
                    typeof item.content === 'string' &&
                    typeof item.sentAt === 'string'
            );
            setHistory(validNotifications);
        } catch {
            setHistory([]);
        }
        setLoadingHistory(false);
    };
    useEffect(() => { loadHistory(); }, []);

    // Send message to parent
    const handleSend = async () => {
        if (!selectedParentId) return;
        setSending(true);
        try {
            await userApi.sendToParent({ parentId: selectedParentId, subject, content });
            setSubject('');
            setContent('');
            setSelectedParentId('');
            toast({
                title: 'Gửi liên hệ thành công',
                description: 'Liên hệ đã được gửi đến phụ huynh.',
                duration: 4000,
            });
            await loadHistory();
        } catch (err) {
            toast({
                title: 'Gửi liên hệ thất bại',
                description: 'Đã có lỗi xảy ra khi gửi liên hệ.',
                duration: 4000,
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Liên hệ phụ huynh</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Tạo liên hệ mới</CardTitle>
                        <CardDescription>Gửi liên hệ đến phụ huynh</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[420px] overflow-y-auto">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tìm kiếm phụ huynh</Label>
                                <Select
                                    options={parents.map(parent => ({
                                        value: parent.userId,
                                        label: parent.fullName + (parent.email ? ` (${parent.email})` : '')
                                    }))}
                                    value={parents
                                        .filter(parent => parent.userId === selectedParentId)
                                        .map(parent => ({
                                            value: parent.userId,
                                            label: parent.fullName + (parent.email ? ` (${parent.email})` : '')
                                        }))[0] || null}
                                    onChange={option => setSelectedParentId(option ? option.value : '')}
                                    isClearable
                                    isSearchable
                                    placeholder="Nhập tên phụ huynh để tìm kiếm và chọn"
                                    isLoading={loadingParents}
                                    noOptionsMessage={() => parentSearch ? 'Không tìm thấy phụ huynh' : 'Nhập tên để tìm kiếm'}
                                    classNamePrefix="select"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tiêu đề</Label>
                                <Input
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="Nhập tiêu đề"
                                    disabled={!selectedParentId}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nội dung</Label>
                                <Textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Nhập nội dung"
                                    rows={4}
                                    disabled={!selectedParentId}
                                />
                            </div>
                            <Button
                                onClick={handleSend}
                                disabled={sending || !selectedParentId || !subject || !content}
                                className="w-full"
                            >
                                {sending ? (
                                    <>
                                        <Send className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Gửi liên hệ
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch sử liên hệ</CardTitle>
                        <CardDescription>Danh sách các liên hệ đã gửi đến phụ huynh</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[380px] overflow-y-auto">
                        <div className="space-y-4">
                            {loadingHistory && <div>Đang tải...</div>}
                            {history.length === 0 && !loadingHistory && <div className="text-sm text-gray-500">Chưa có liên hệ nào</div>}
                            {history.map((item) => (
                                <div key={item.notificationId} className="p-4 border rounded-lg space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold">{item.recipientName}</div>
                                            <div className="text-xs text-gray-500">{item.sentAt}</div>
                                        </div>
                                        <div className="text-xs font-medium">{item.subject}</div>
                                    </div>
                                    <div className="text-sm text-gray-600">{item.content}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 