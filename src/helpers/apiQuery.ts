import axios from 'axios';
import type { AxiosResponse } from 'axios';

const TIMEOUT = 10000;

// Standardized JSON shape returned by the backend API
interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

const addParamToUrl = (url: string, params: Record<string, string | number | boolean> = {}) => {
    Object.entries(params).forEach(([key, value]) => {
        url += `${url.includes('?') ? '&' : '?'}${key}=${value}`
    })

    return url;
}

// Thrown when a request exceeds timeout, mapped to HTTP 504
class TimeoutError extends Error {
    status: number;

    constructor(message: string = 'Request timeout') {
        super(message);
        this.name = 'TimeoutError';
        this.status = 504;
    }
}

const calculateTimeout = (): Promise<never> => new Promise((_, reject) => {
    setTimeout(() => {
        reject(new TimeoutError());
    }, TIMEOUT);
});

const getQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {}
): Promise<ApiResponse<T>> => {
    url = addParamToUrl(url, params);

    const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
        axios.get<ApiResponse<T>>(url),
        calculateTimeout()
    ]);

    return response.data;
}

const postQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {},
    body: object
): Promise<ApiResponse<T>> => {
    url = addParamToUrl(url, params);

    const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
        axios.post<ApiResponse<T>>(url, body),
        calculateTimeout()
    ]);

    return response.data;
}

const putQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {},
    body: object
): Promise<ApiResponse<T>> => {
    url = addParamToUrl(url, params);

    const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
        axios.put<ApiResponse<T>>(url, body),
        calculateTimeout()
    ]);

    return response.data;
}

const deleteQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {}
): Promise<ApiResponse<T>> => {
    url = addParamToUrl(url, params);

    const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
        axios.delete<ApiResponse<T>>(url),
        calculateTimeout()
    ]);

    return response.data;
}

export { getQuery, postQuery, putQuery, deleteQuery };
