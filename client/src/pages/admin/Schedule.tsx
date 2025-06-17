import { useEffect, useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getStudents } from '@/api/studentApi';


interface Schedule {
    id: string;
    className: string;
    teacher: string;
    room: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    startDate: Date;
    endDate: Date;
}

const sampleSchedules: Schedule[] = [
    {
        id: "1",
        className: "Lớp A1",
        teacher: "Nguyễn Văn A",
        room: "Phòng 101",
        startTime: "08:00",
        endTime: "09:30",
        dayOfWeek: "Thứ 2",
        startDate: new Date(2024, 2, 1),
        endDate: new Date(2024, 5, 30),
    },
    {
        id: "2",
        className: "Lớp B2",
        teacher: "Trần Thị B",
        room: "Phòng 102",
        startTime: "13:30",
        endTime: "15:00",
        dayOfWeek: "Thứ 4",
        startDate: new Date(2024, 2, 1),
        endDate: new Date(2024, 5, 30),
    },
];

const daysOfWeek = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
];

const rooms = ["Phòng 101", "Phòng 102", "Phòng 103", "Phòng 104"];

export default function AdminSchedule() {
    const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules);
    const [selectedDay, setSelectedDay] = useState<string>("Thứ 2");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
        className: "",
        teacher: "",
        room: "",
        startTime: "",
        endTime: "",
        dayOfWeek: "Thứ 2",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    });

    const handleAddSchedule = () => {
        if (
            newSchedule.className &&
            newSchedule.teacher &&
            newSchedule.room &&
            newSchedule.startTime &&
            newSchedule.endTime &&
            newSchedule.dayOfWeek &&
            newSchedule.startDate &&
            newSchedule.endDate
        ) {
            const schedule: Schedule = {
                id: Date.now().toString(),
                className: newSchedule.className,
                teacher: newSchedule.teacher,
                room: newSchedule.room,
                startTime: newSchedule.startTime,
                endTime: newSchedule.endTime,
                dayOfWeek: newSchedule.dayOfWeek,
                startDate: newSchedule.startDate,
                endDate: newSchedule.endDate,
            };
            setSchedules([...schedules, schedule]);
            setIsAddDialogOpen(false);
            setNewSchedule({
                className: "",
                teacher: "",
                room: "",
                startTime: "",
                endTime: "",
                dayOfWeek: "Thứ 2",
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            });
        }
    };

    const filteredSchedules = schedules.filter(
        (schedule) => schedule.dayOfWeek === selectedDay
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Quản lý lịch học</h2>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Thêm lịch học
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm lịch học mới</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="className">Tên lớp</Label>
                                <Input
                                    id="className"
                                    value={newSchedule.className}
                                    onChange={(e) =>
                                        setNewSchedule({ ...newSchedule, className: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="teacher">Giáo viên</Label>
                                <Input
                                    id="teacher"
                                    value={newSchedule.teacher}
                                    onChange={(e) =>
                                        setNewSchedule({ ...newSchedule, teacher: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="room">Phòng học</Label>
                                <Select
                                    value={newSchedule.room}
                                    onValueChange={(value) =>
                                        setNewSchedule({ ...newSchedule, room: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn phòng học" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem key={room} value={room}>
                                                {room}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dayOfWeek">Thứ</Label>
                                <Select
                                    value={newSchedule.dayOfWeek}
                                    onValueChange={(value) =>
                                        setNewSchedule({ ...newSchedule, dayOfWeek: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn thứ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysOfWeek.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="startTime">Giờ bắt đầu</Label>
                                    <Input
                                        id="startTime"
                                        type="time"
                                        value={newSchedule.startTime}
                                        onChange={(e) =>
                                            setNewSchedule({ ...newSchedule, startTime: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endTime">Giờ kết thúc</Label>
                                    <Input
                                        id="endTime"
                                        type="time"
                                        value={newSchedule.endTime}
                                        onChange={(e) =>
                                            setNewSchedule({ ...newSchedule, endTime: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Thời gian áp dụng</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Từ ngày</Label>
                                        <Calendar
                                            mode="single"
                                            selected={newSchedule.startDate}
                                            onSelect={(date) =>
                                                date && setNewSchedule({ ...newSchedule, startDate: date })
                                            }
                                            locale={vi}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm">Đến ngày</Label>
                                        <Calendar
                                            mode="single"
                                            selected={newSchedule.endDate}
                                            onSelect={(date) =>
                                                date && setNewSchedule({ ...newSchedule, endDate: date })
                                            }
                                            locale={vi}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAddSchedule}>Thêm lịch học</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lịch học theo thứ</CardTitle>
                    <CardDescription>
                        Xem và quản lý lịch học theo từng ngày trong tuần
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {daysOfWeek.map((day) => (
                                <Button
                                    key={day}
                                    variant={selectedDay === day ? "default" : "outline"}
                                    onClick={() => setSelectedDay(day)}
                                >
                                    {day}
                                </Button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filteredSchedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className="p-4 border rounded-lg space-y-2"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{schedule.className}</h3>
                                            <p className="text-sm text-gray-500">
                                                Giáo viên: {schedule.teacher}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {schedule.startTime} - {schedule.endTime}
                                            </p>
                                            <p className="text-sm text-gray-500">{schedule.room}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <p>
                                            Từ {format(schedule.startDate, "dd/MM/yyyy", { locale: vi })} đến{" "}
                                            {format(schedule.endDate, "dd/MM/yyyy", { locale: vi })}
                                        </p>
                                        <Button variant="outline" size="sm">
                                            Chỉnh sửa
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 