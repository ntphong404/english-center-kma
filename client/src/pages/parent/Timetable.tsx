import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Class {
    id: string;
    childId: string;
    childName: string;
    name: string;
    teacher: string;
    room: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    level: string;
}

const classes: Class[] = [
    {
        id: '1',
        childId: '1',
        childName: 'Nguyễn Văn An',
        name: 'Tiếng Anh Giao Tiếp A1',
        teacher: 'Nguyễn Văn A',
        room: 'Phòng 101',
        startTime: '08:00',
        endTime: '09:30',
        dayOfWeek: 'Thứ 2',
        level: 'Beginner',
    },
    {
        id: '2',
        childId: '1',
        childName: 'Nguyễn Văn An',
        name: 'Ngữ Pháp Cơ Bản',
        teacher: 'Trần Thị B',
        room: 'Phòng 102',
        startTime: '13:30',
        endTime: '15:00',
        dayOfWeek: 'Thứ 4',
        level: 'Intermediate',
    },
    {
        id: '3',
        childId: '2',
        childName: 'Nguyễn Thị Bình',
        name: 'Tiếng Anh Giao Tiếp B1',
        teacher: 'Lê Văn C',
        room: 'Phòng 103',
        startTime: '15:30',
        endTime: '17:00',
        dayOfWeek: 'Thứ 3',
        level: 'Advanced',
    },
];

const daysOfWeek = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
];

export default function ParentTimetable() {
    const children = Array.from(new Set(classes.map(c => c.childId))).map(childId => {
        const c = classes.find(c => c.childId === childId);
        return { id: childId, name: c?.childName || '' };
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Thời khóa biểu tuần</h1>
            <div className="grid gap-6 md:grid-cols-2">
                {children.map(child => (
                    <Card key={child.id}>
                        <CardHeader>
                            <CardTitle>{child.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full border text-sm">
                                <thead>
                                    <tr>
                                        <th className="border px-2 py-1">Thứ</th>
                                        <th className="border px-2 py-1">Lớp</th>
                                        <th className="border px-2 py-1">Giáo viên</th>
                                        <th className="border px-2 py-1">Phòng</th>
                                        <th className="border px-2 py-1">Thời gian</th>
                                        <th className="border px-2 py-1">Cấp độ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daysOfWeek.map(day => {
                                        const classOfDay = classes.find(c => c.childId === child.id && c.dayOfWeek === day);
                                        return (
                                            <tr key={day}>
                                                <td className="border px-2 py-1 font-medium">{day}</td>
                                                {classOfDay ? (
                                                    <>
                                                        <td className="border px-2 py-1">{classOfDay.name}</td>
                                                        <td className="border px-2 py-1">{classOfDay.teacher}</td>
                                                        <td className="border px-2 py-1">{classOfDay.room}</td>
                                                        <td className="border px-2 py-1">{classOfDay.startTime} - {classOfDay.endTime}</td>
                                                        <td className="border px-2 py-1"><Badge variant="outline">{classOfDay.level}</Badge></td>
                                                    </>
                                                ) : (
                                                    <td className="border px-2 py-1 text-gray-400" colSpan={5}>-</td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 