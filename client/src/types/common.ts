export interface Pageable {
    page: number;
    size: number;
    sort?: string;
}

export interface Page<T> {
    content: T[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
} 