import { ClassResponse } from "./entityclass";

export interface DashboardResponse {
    totalStudents: number;
    totalTeachers: number;
    totalTuitionFeesOfMonth: number;
    totalTuitionFeesUnPaid: number;
    classesUpcoming: ClassResponse[];
}