import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { progressService } from "@/features/progress/services/progress-service";

export function useProgress() {
  return useQuery({ queryKey: queryKeys.progress.all, queryFn: progressService.get });
}
