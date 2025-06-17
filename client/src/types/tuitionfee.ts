
export interface TuitionFeeResponse {
    tuitionFeeId: string;
    studentId: string;
    classId: string;
    yearMonth: string;
    amount: number;
    remainingAmount: number;
}

export interface UpdateTuitionFeeRequest {
    studentId: string;
    classId: string;
    yearMonth: string;
    amount: number;
    remainingAmount: number;
}