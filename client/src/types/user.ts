import { Role } from './role';

export interface User {
    userId: string;
    username: string;
    fullName: string | null;
    email: string | null;
    dob: string | null;
    role: Role;
}

export interface UserCreateRequest {
    username: string;
    password: string;
    fullName: string;
    email: string;
    dob: string;
    role: string;
}

export interface UserUpdateRequest {
    fullName: string;
    email: string;
    dob: string;
    role: string;
}
