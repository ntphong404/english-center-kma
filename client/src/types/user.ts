
export interface User {
    userId: string;
    username: string;
    fullName: string | null;
    email: string | null;
    gender: string | null;
    phoneNumber: string | null;
    address: string | null;
    avatarUrl: string | null;
    dob: string | null;
    role: string;
}

export interface ClassDiscount {
    classId: string;
    discount: number;
}

export interface Student extends User {
    parentId: string;
    classDiscounts: ClassDiscount[];
}

export interface Parent extends User {
    studentIds: string[];
}

export interface Teacher extends User {
    salary: number;
}

// CREATE
export interface UserCreateRequest {
    username: string;
    password: string;
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    address: string;
    dob: string;
}

export interface CreateTeacherRequest {
    username: string;
    password: string;
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    address: string;
    dob: string;
    salary: number;
}

export interface CreateStudentRequest {
    username: string;
    password: string;
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    address: string;
    dob: string;
    classDiscounts: ClassDiscount[];
}

// UPDATE 
export interface UpdateTeacherRequest {
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    address: string;
    dob: string;
    salary: number;
}

export interface UpdateStudentRequest {
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    address: string;
    dob: string;
    classDiscounts: ClassDiscount[];
}

export interface UserUpdateRequest {
    fullName: string;
    email: string;
    gender: string;
    phone: string;
    address: string;
    dob: string;
}
