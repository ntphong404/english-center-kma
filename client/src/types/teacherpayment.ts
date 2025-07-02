export interface TeacherPaymentResponse {
    id: string;
    teacherId: string;
    teacherName: string;
    month: number;
    year: number;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    createdAt: string;
    note: string;
    status: string;
}

export interface CreateTeacherPaymentRequest {
    teacherId: string;
    month: number;
    year: number;
    amount: number;
    paidAmount: number;
    note: string;
}