
export interface AttendanceUpdateRequest {
    date: string;
    studentAttendances: StudentAttendance[];
}

export interface StudentAttendance {
    studentId: string;
    status: string;
    note: string;
}

export interface AttendanceResponse {
    attendanceId: string;
    classId: string;
    date: string;
    studentAttendances: StudentAttendance[];
}
