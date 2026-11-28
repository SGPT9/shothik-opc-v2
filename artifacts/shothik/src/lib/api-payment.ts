import axios, { InternalAxiosRequestConfig } from "axios";

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_PAYMENT_SYSTEM_URL) {
    return process.env.NEXT_PUBLIC_PAYMENT_SYSTEM_URL;
  }
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 8000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;
