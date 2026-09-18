import { create, type AxiosError } from "axios";
import * as Device from "expo-device";

import { tokenStorage } from "@/features/auth/services/token-storage";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBaseUrl() {
  if (Device.isDevice) {
    return (
      process.env.EXPO_PUBLIC_REAL_DEVICE_API_URL ??
      process.env.EXPO_PUBLIC_REAL_IOS_DEVICE_API_URL
    );
  }

  return process.env.EXPO_OS === "android"
    ? process.env.EXPO_PUBLIC_REAL_ANDROID_DEVICE_API_URL
    : process.env.EXPO_PUBLIC_API_URL;
}

const baseURL = getApiBaseUrl();

if (!baseURL) {
  throw new Error("Configure une URL API Expo dans le fichier .env.");
}

let unauthorizedHandler: (() => void | Promise<void>) | undefined;

export function setUnauthorizedHandler(handler: () => void | Promise<void>) {
  unauthorizedHandler = handler;
}

export const api = create({
  baseURL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 10_000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status ?? 0;
    if (status === 401) await unauthorizedHandler?.();

    throw new ApiError(
      error.response?.data?.message ??
        (status === 0 ? "Impossible de joindre le serveur." : "La requête a échoué."),
      status,
      error.response?.data?.errors,
    );
  },
);
