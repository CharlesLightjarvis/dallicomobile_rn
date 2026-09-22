import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { chapterService } from "@/features/learn/chapters/services/chapters-service";

export function useChapters(level: string) {
  return useQuery({
    queryKey: queryKeys.chapters.list(level),
    queryFn: () => chapterService.getChapters(level),
    enabled: level.length > 0,
  });
}
