export interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export interface PageResponse<T> {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}
// ApiResponse<PageResponse<Student>>