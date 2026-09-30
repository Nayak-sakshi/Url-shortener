import { request } from "./client";

export const createShortUrl = (data) =>
    request("/urls", { method: "POST", body: data });

export const getMyUrls = ({ page = 1, limit = 10 } = {}) =>
    request("/urls/my", { query: { page, limit } });

export const getUrl = (id) => request(`/urls/${id}`);

export const updateUrl = (id, data) =>
    request(`/urls/${id}`, { method: "PATCH", body: data });

export const deleteUrl = (id) =>
    request(`/urls/${id}`, { method: "DELETE" });
