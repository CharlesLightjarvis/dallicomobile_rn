import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { levelService } from "@/features/learn/levels/services/levels-service";

export function useLevels() {
  return useQuery({
    queryKey: queryKeys.levels.list(),
    queryFn: levelService.getLevels,
  });
}
