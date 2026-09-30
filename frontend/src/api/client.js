import { clearToken, getToken } from "../utils/storage";

export const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

export const AUTH_EXPIRED_EVENT = "auth:expired";

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const FALLBACK_MESSAGES = {
    0: "Can't reach the server. Check that the backend is running.",
    429: "Too many requests. Wait a minute and try again.",
    500: "The server hit an error. Try again."
};

export async function request(path, { method = "GET", body, query } = {}) {
    const token = getToken();

    const headers = {};

    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const search = query ? `?${new URLSearchParams(query)}` : "";

    let response;

    try {
        response = await fetch(`${API_BASE}${path}${search}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    } catch {
        throw new ApiError(FALLBACK_MESSAGES[0], 0);
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        // A rejected token means the session is over everywhere
        if (response.status === 401 && token) {
            clearToken();
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));

            throw new ApiError("Your session ended. Log in again.", 401);
        }

        const message =
            (response.status < 500 && payload?.message) ||
            FALLBACK_MESSAGES[response.status] ||
            payload?.message ||
            FALLBACK_MESSAGES[500];

        throw new ApiError(message, response.status);
    }

    return payload?.data ?? null;
}
