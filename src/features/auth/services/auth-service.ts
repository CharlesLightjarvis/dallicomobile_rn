import { api } from "@/lib/api";
import type { ApiSuccessResponse } from "@/lib/types/api-response";
import type {
  AuthPayload,
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/features/auth/types/auth";

export const authService = {
  login: async (input: LoginInput) =>
    (await api.post<ApiSuccessResponse<AuthPayload>>("/api/v1/login", input)).data,
  register: async (input: RegisterInput) =>
    (await api.post<ApiSuccessResponse<AuthPayload>>("/api/v1/register", input)).data,
  me: async () => (await api.get<ApiSuccessResponse<AuthUser>>("/api/v1/me")).data,
  logout: async () =>
    (await api.post<ApiSuccessResponse<null>>("/api/v1/logout")).data,
};
