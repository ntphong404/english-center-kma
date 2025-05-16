import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface Schedule {
    id: string;
    childId: string;
    childName: string;
    className: string;
    teacher: string;
    room: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    level: string;
}

const sampleSchedules: Schedule[] = [
    {
        id: "1",
        childId: "1",
        childName: "Nguyễn Văn An",
        className: "Tiếng Anh Giao Tiếp A1",
        teacher: "Nguyễn Văn A",
        room: "Phòng 101",
        startTime: "08:00",
        endTime: "09:30",
        dayOfWeek: "Thứ 2",
        level: "Beginner",
    },
    {
        id: "2",
        childId: "1",
        childName: "Nguyễn Văn An",
        className: "Ngữ Pháp Cơ Bản",
        teacher: "Trần Thị B",
        room: "Phòng 102",
        startTime: "13:30",
        endTime: "15:00",
        dayOfWeek: "Thứ 4",
        level: "Intermediate",
    },
    {
        id: "3",
        childId: "2",
        childName: "Nguyễn Thị Bình",
        className: "Tiếng Anh Giao Tiếp B1",
        teacher: "Lê Văn C",
        room: "Phòng 103",
        startTime: "15:30",
        endTime: "17:00",
        dayOfWeek: "Thứ 3",
        level: "Advanced",
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

export default function ParentSchedule() {
    const [selectedDay, setSelectedDay] = useState<string>("Thứ 2");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedChild, setSelectedChild] = useState<string>("all");

    const filteredSchedules = sampleSchedules.filter(
        (schedule) =>
            schedule.dayOfWeek === selectedDay &&
            (selectedChild === "all" || schedule.childId === selectedChild)
    );

    const children = Array.from(
        new Set(sampleSchedules.map((schedule) => schedule.childId))
    ).map((childId) => {
        const schedule = sampleSchedules.find((s) => s.childId === childId);
        return {
            id: childId,
            name: schedule?.childName || "",
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lịch học</h2>
            </div>

            <div className="flex gap-2">
                <Button
                    variant={selectedChild === "all" ? "default" : "outline"}
                    onClick={() => setSelectedChild("all")}
                >
                    Tất cả học sinh
                </Button>
                {children.map((child) => (
                    <Button
                        key={child.id}
                        variant={selectedChild === child.id ? "default" : "outline"}
                        onClick={() => setSelectedChild(child.id)}
                    >
                        {child.name}
                    </Button>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo thứ</CardTitle>
                        <CardDescription>
                            Xem lịch học theo từng ngày trong tuần
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-2 flex-wrap">
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
                                                    Học sinh: {schedule.childName}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Giáo viên: {schedule.teacher}
                                                </p>
                                                <Badge variant="outline" className="mt-1">
                                                    {schedule.level}
                                                </Badge>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </p>
                                                <p className="text-sm text-gray-500">{schedule.room}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo ngày</CardTitle>
                        <CardDescription>
                            Chọn ngày để xem lịch học
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            locale={vi}
                            className="rounded-md border"
                        />
                        <div className="mt-4 p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">
                                Lịch học ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
                            </h3>
                            <div className="space-y-2">
                                {filteredSchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <div>
                                            <span className="font-medium">{schedule.className}</span>
                                            <span className="text-gray-500 ml-2">
                                                ({schedule.childName})
                                            </span>
                                        </div>
                                        <span>
                                            {schedule.startTime} - {schedule.endTime}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 