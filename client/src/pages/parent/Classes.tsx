import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video } from 'lucide-react';

interface Material {
    id: string;
    type: 'document' | 'video';
    name: string;
}

interface Class {
    id: string;
    childId: string;
    childName: string;
    name: string;
    teacher: string;
    level: string;
    progress: number;
    materials: Material[];
}

const classes: Class[] = [
    {
        id: '1',
        childId: '1',
        childName: 'Nguyễn Văn An',
        name: 'Tiếng Anh Giao Tiếp A1',
        teacher: 'Nguyễn Văn A',
        level: 'Beginner',
        progress: 70,
        materials: [
            { id: 'm1', type: 'document', name: 'Bài tập tuần 1.pdf' },
            { id: 'm2', type: 'video', name: 'Video bài giảng 1' },
        ],
    },
    {
        id: '2',
        childId: '1',
        childName: 'Nguyễn Văn An',
        name: 'Ngữ Pháp Cơ Bản',
        teacher: 'Trần Thị B',
        level: 'Intermediate',
        progress: 50,
        materials: [
            { id: 'm3', type: 'document', name: 'Ngữ pháp cơ bản.docx' },
        ],
    },
    {
        id: '3',
        childId: '2',
        childName: 'Nguyễn Thị Bình',
        name: 'Tiếng Anh Giao Tiếp B1',
        teacher: 'Lê Văn C',
        level: 'Advanced',
        progress: 90,
        materials: [
            { id: 'm4', type: 'video', name: 'Bài giảng nâng cao' },
        ],
    },
];

export default function ParentClasses() {
    const children = Array.from(new Set(classes.map(c => c.childId))).map(childId => {
        const c = classes.find(c => c.childId === childId);
        return { id: childId, name: c?.childName || '' };
    });

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Thông tin lớp học</h1>
            <div className="grid gap-6 md:grid-cols-2">
                {children.map(child => (
                    <Card key={child.id}>
                        <CardHeader>
                            <CardTitle>{child.name}</CardTitle>
                            <CardDescription>Các lớp đang học</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {classes.filter(c => c.childId === child.id).map(cls => (
                                <div key={cls.id} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        <span className="font-semibold">{cls.name}</span>
                                        <Badge variant="outline">{cls.level}</Badge>
                                    </div>
                                    <div className="text-sm text-gray-500 mb-1">Giáo viên: {cls.teacher}</div>
                                    <div className="mb-2">
                                        <span className="text-xs text-gray-500">Tiến độ học:</span>
                                        <Progress value={cls.progress} className="h-2 mt-1" />
                                        <span className="text-xs ml-2">{cls.progress}%</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Tài liệu:</span>
                                        <div className="flex gap-2 mt-1 flex-wrap">
                                            {cls.materials.map(mat => (
                                                <Button key={mat.id} variant="outline" size="sm" className="flex items-center gap-1">
                                                    {mat.type === 'document' ? <FileText className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                                    {mat.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 