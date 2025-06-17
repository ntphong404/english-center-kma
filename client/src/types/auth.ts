import { User } from './user';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LogoutRequest {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}
