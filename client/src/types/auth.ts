import { User } from './User';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
    authenticated: boolean;
}
