import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Schedule {
    id: string;
    className: string;
    room: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    students: number;
    level: string;
}

const sampleSchedules: Schedule[] = [
    {
        id: "1",
        className: "Lớp A1",
        room: "Phòng 101",
        startTime: "08:00",
        endTime: "09:30",
        dayOfWeek: "Thứ 2",
        students: 15,
        level: "Beginner",
    },
    {
        id: "2",
        className: "Lớp B2",
        room: "Phòng 102",
        startTime: "13:30",
        endTime: "15:00",
        dayOfWeek: "Thứ 4",
        students: 12,
        level: "Intermediate",
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

export default function TeacherSchedule() {
    const [selectedDay, setSelectedDay] = useState<string>("Thứ 2");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const filteredSchedules = sampleSchedules.filter(
        (schedule) => schedule.dayOfWeek === selectedDay
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lịch dạy</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch theo thứ</CardTitle>
                        <CardDescription>
                            Xem lịch dạy theo từng ngày trong tuần
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
                                                    Trình độ: {schedule.level}
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
                                            <p>Số học viên: {schedule.students}</p>
                                            <Button variant="outline" size="sm">
                                                Xem chi tiết
                                            </Button>
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
                            Chọn ngày để xem lịch dạy
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
                                Lịch dạy ngày {format(selectedDate, "dd/MM/yyyy", { locale: vi })}
                            </h3>
                            <div className="space-y-2">
                                {filteredSchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="flex justify-between items-center text-sm"
                                    >
                                        <span>{schedule.className}</span>
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