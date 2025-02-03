import { ApiResponse } from '../types/api';

export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
        success: true,
        data,
        message
    };
}

export function errorResponse(error: string): ApiResponse<null> {
    return {
        success: false,
        error
    };
}