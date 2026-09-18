import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { levelService } from "@/features/levels/services/level-service";

export function useLevels() {
  return useQuery({
    queryKey: queryKeys.levels.list(),
    queryFn: levelService.getLevels,
  });
}
