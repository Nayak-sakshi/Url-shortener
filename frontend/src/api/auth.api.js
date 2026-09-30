import { request } from "./client";

export const register = (data) =>
    request("/auth/register", { method: "POST", body: data });

export const login = (data) =>
    request("/auth/login", { method: "POST", body: data });

export const getProfile = () => request("/auth/profile");
