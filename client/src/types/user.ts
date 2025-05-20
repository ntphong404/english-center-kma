import { Role } from './role';

export interface User {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    dob: string | null;
    role: Role;
}

export interface UserCreateRequest {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    dob: string;
    role: string;
}

export interface UserUpdateRequest {
    firstName: string;
    lastName: string;
    dob: string;
    role: string;
}
