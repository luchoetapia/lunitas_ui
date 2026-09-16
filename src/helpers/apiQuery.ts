import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { AlertColor } from '@mui/material/Alert';
import useAlertStore from '../stores/AlertStore';

const TIMEOUT = 10000;
const API_URL = import.meta.env.VITE_API_URL;

// Standardized JSON shape returned by the backend API
interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

const getFormatedUrl = (url: string, params: Record<string, string | number | boolean> = {}) => {
    if (!url.startsWith('http'))
        url = `${API_URL}${ url.startsWith('/') ? '' : '/' }${url}`;
    
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

interface ErrorConfig {
    message: string;
    alertType: AlertColor;
}

// Only the most common statuses get a specific message; everything else falls to DEFAULT_ERROR
const ERROR_MESSAGES: Record<number, ErrorConfig> = {
    400: { message: 'Solicitud inválida. Revisá los datos ingresados.', alertType: 'error' },
    401: { message: 'Tu sesión expiró o no tenés permisos. Iniciá sesión nuevamente.', alertType: 'warning' },
    403: { message: 'No tenés permisos para realizar esta acción.', alertType: 'error' },
    404: { message: 'No se encontró el recurso solicitado.', alertType: 'error' },
    500: { message: 'Ocurrió un error en el servidor. Intentá más tarde.', alertType: 'error' },
    504: { message: 'La solicitud tardó demasiado en responder. Intentá nuevamente.', alertType: 'error' },
};

const DEFAULT_ERROR: ErrorConfig = {
    message: 'Ocurrió un error inesperado. Intentá nuevamente.',
    alertType: 'error',
};

const getErrorStatus = (error: unknown): number | undefined => {
    if (axios.isAxiosError(error)) return error.response?.status;
    if (error instanceof TimeoutError) return error.status;

    return undefined;
}

// Shows the global alert with a user-facing message and rethrows so callers
// can still react (e.g. stop a loading spinner) if they choose to.
const handleApiError = (error: unknown): never => {
    const status = getErrorStatus(error);
    const { message, alertType } = (status && ERROR_MESSAGES[status]) || DEFAULT_ERROR;

    useAlertStore.getState().showAlert(message, alertType);

    throw error;
}

const getQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {}
): Promise<ApiResponse<T>> => {
    url = getFormatedUrl(url, params);

    try {
        const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
            axios.get<ApiResponse<T>>(url),
            calculateTimeout()
        ]);

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

const postQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {},
    body: object
): Promise<ApiResponse<T>> => {
    url = getFormatedUrl(url, params);

    try {
        const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
            axios.post<ApiResponse<T>>(url, body),
            calculateTimeout()
        ]);

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

const putQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {},
    body: object
): Promise<ApiResponse<T>> => {
    url = getFormatedUrl(url, params);

    try {
        const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
            axios.put<ApiResponse<T>>(url, body),
            calculateTimeout()
        ]);

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

const deleteQuery = async <T>(
    url: string,
    params: Record<string, string | number | boolean> = {}
): Promise<ApiResponse<T>> => {
    url = getFormatedUrl(url, params);

    try {
        const response: AxiosResponse<ApiResponse<T>> = await Promise.race([
            axios.delete<ApiResponse<T>>(url),
            calculateTimeout()
        ]);

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export { getQuery, postQuery, putQuery, deleteQuery };
