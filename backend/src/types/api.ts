import { Request } from 'express';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface AuthenticatedRequest extends Request {
    user?: { 
        id: number; 
        username: string; 
        role: string; 
    };
}