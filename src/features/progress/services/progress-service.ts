import { api } from "@/lib/api";
import type { GlobalProgress } from "@/features/progress/types/progress";
import type { ApiSuccessResponse } from "@/lib/types/api-response";

export const progressService = {
  async get(): Promise<GlobalProgress> {
    return (await api.get<ApiSuccessResponse<GlobalProgress>>("/api/v1/me/progress")).data.data;
  },
};
