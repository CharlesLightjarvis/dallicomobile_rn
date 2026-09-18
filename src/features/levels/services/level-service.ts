import { api } from "@/lib/api";
import type { Level } from "@/features/levels/types/level";
import type { LaravelResourceResponse } from "@/lib/types/api-response";

export const levelService = {
  async getLevels(): Promise<Level[]> {
    return (await api.get<LaravelResourceResponse<Level[]>>("/api/v1/levels")).data.data;
  },
};
