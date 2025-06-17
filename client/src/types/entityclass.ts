export interface ClassUpdateRequest {
    className: string;
    year: number;
    teacherId: string;
    studentIds: string[];
    unitPrice: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    grade: number;
    roomName: string;
}

export interface ClassResponse {
    classId: string;
    className: string;
    year: number;
    grade: number;
    status: string;
    teacherId: string;
    studentIds: string[];
    unitPrice: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    roomName: string;
}

export interface CreateClassRequest {
    className: string;
    year: number;
    teacherId: string;
    unitPrice: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    grade: number;
    roomName: string;
}