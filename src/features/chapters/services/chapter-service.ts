import { api } from "@/lib/api";
import type { Chapter } from "@/features/chapters/types/chapter";
import type { LaravelResourceResponse } from "@/lib/types/api-response";

export const chapterService = {
  async getChapters(level: string): Promise<Chapter[]> {
    return (await api.get<LaravelResourceResponse<Chapter[]>>(`/api/v1/levels/${encodeURIComponent(level)}/chapters`)).data.data;
  },
};
