import { request } from "./client";

export const getUrlAnalytics = (urlId) => request(`/analytics/${urlId}`);
